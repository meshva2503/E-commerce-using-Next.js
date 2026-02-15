import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { generateEmbedding } from '@/lib/embeddingService';
import { searchSimilarProducts } from '@/lib/pineconeService';
import { searchProducts } from '@/lib/bm25SearchService';
import { mergeAndRank } from '@/lib/hybridRanker';

/**
 * Hybrid AI Product Search
 * Combines:
 * 1) BM25 keyword search (MongoDB)
 * 2) Semantic vector search (Pinecone)
 * 3) Hybrid ranking
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query || !query.trim()) {
            return NextResponse.json(
                { error: 'Query parameter "q" is required' },
                { status: 400 }
            );
        }

        const trimmedQuery = query.trim();
        console.log(`🔍 Search query: "${trimmedQuery}"`);

        await connectDB();

        // ---------- STEP 1: Run keyword search + generate embedding ----------
        const [bm25Results, queryEmbedding] = await Promise.all([
            searchProducts(trimmedQuery, 20),
            generateEmbedding(trimmedQuery, 'query')
        ]);

        // ---------- STEP 2: Semantic vector search ----------
        const vectorResults = await searchSimilarProducts(queryEmbedding, 20);

        // ---------- STEP 3: Fetch products for vector results ----------
        const vectorProductIds = vectorResults.map(r => r.id);

        const vectorProducts = await Product.find({
            _id: { $in: vectorProductIds }
        });

        // ---------- STEP 4: Create product map ----------
        const productMap = new Map<string, any>();

        bm25Results.forEach(result => {
            productMap.set(result.product._id.toString(), result.product);
        });

        vectorProducts.forEach(product => {
            const id = product._id.toString();
            if (!productMap.has(id)) {
                productMap.set(id, product.toObject());
            }
        });

        // ---------- STEP 5: Hybrid ranking ----------
        const hybridResults = mergeAndRank(bm25Results, vectorResults, productMap);

        // ---------- STEP 6: Extract price constraints ----------
        let maxPrice = Infinity;
        const priceMatch = trimmedQuery.match(/(?:under|below|less than)\s*(\d+(?:,\d+)*)/i);
        if (priceMatch) {
            maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
            console.log(`💰 Price filter detected: < ${maxPrice}`);
        }

        // ---------- STEP 7: Detect broad query ----------
        const isBroadQuery =
            /\b(gift|present|something|anything|idea|recommend|decor|home)\b/i.test(trimmedQuery);

        if (isBroadQuery) {
            console.log('🎁 Broad intent query detected — relaxing semantic threshold');
        }

        // ---------- STEP 8: Intelligent filtering ----------
        const filteredResults = hybridResults.filter(r => {
            let scorePass = false;

            // Different thresholds per match type
            if (r.matchType === 'hybrid') {
                scorePass = r.score >= 0.30;
            } else if (r.matchType === 'keyword') {
                scorePass = r.score >= 0.25;
            } else if (r.matchType === 'semantic') {
                scorePass = r.score >= (isBroadQuery ? 0.08 : 0.12);
            }

            const meetsPrice = r.product.price <= maxPrice;

            return scorePass && meetsPrice;
        });

        // ---------- STEP 9: Final ranking order ----------
        // Prefer hybrid > semantic > keyword when scores are close
        filteredResults.sort((a, b) => {
            const priority = { hybrid: 3, semantic: 2, keyword: 1 };

            if (Math.abs(b.score - a.score) < 0.05) {
                return priority[b.matchType] - priority[a.matchType];
            }
            return b.score - a.score;
        });

        // ---------- STEP 10: Format response ----------
        const formattedResults = filteredResults.map(r => ({
            _id: r.product._id,
            name: r.product.name,
            description: r.product.description,
            category: r.product.category,
            price: r.product.price,
            image: r.product.image,
            score: Number(r.score.toFixed(3)),
            matchType: r.matchType
        }));

        console.log(`📊 Results → Keyword: ${bm25Results.length}, Semantic: ${vectorResults.length}, Final: ${formattedResults.length}`);

        return NextResponse.json({
            results: formattedResults,
            total: formattedResults.length,
            query: trimmedQuery,
            debug: {
                bm25Count: bm25Results.length,
                vectorCount: vectorResults.length,
                hybridCount: formattedResults.filter(r => r.matchType === 'hybrid').length
            }
        });

    } catch (error) {
        console.error('Search API error:', error);

        return NextResponse.json(
            {
                error: 'Search failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
