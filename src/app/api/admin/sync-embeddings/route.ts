import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { generateProductEmbedding } from '@/lib/embeddingService';
import { upsertProductVector } from '@/lib/pineconeService';

export async function POST() {
    try {
        await connectDB();

        // Fetch all products with populated category names
        const products = await Product.find({}).populate('category');
        console.log(`Found ${products.length} products to sync`);

        let successCount = 0;
        let errorCount = 0;

        // Process sequentially to avoid hitting API rate limits
        const errors: string[] = [];

        for (const product of products) {
            try {
                console.log(`Syncing product: ${product.name}`);

                // Get category name for embedding semantic value
                const categoryName = product.category && typeof product.category !== 'string'
                    ? (product.category as any).name
                    : '';

                // Generate embedding
                const embedding = await generateProductEmbedding({
                    name: product.name,
                    description: product.description,
                    category: categoryName
                });

                // Upload to Pinecone
                await upsertProductVector(
                    product._id.toString(),
                    embedding,
                    {
                        name: product.name,
                        category: product.category?._id?.toString(), // Use Category ID for metadata
                        price: product.price
                    }
                );

                successCount++;
            } catch (error) {
                const errorMessage = `Failed to sync product ${product.name} (${product._id}): ${error instanceof Error ? error.message : String(error)}`;
                console.error(errorMessage);
                errors.push(errorMessage);
                errorCount++;
            }
        }

        return NextResponse.json({
            message: 'Sync complete',
            total: products.length,
            success: successCount,
            failed: errorCount,
            errors: errors
        });

    } catch (error) {
        console.error('Sync failed:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Allow GET request for easier triggering via browser
export async function GET() {
    return POST();
}
