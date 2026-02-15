import { connectDB } from './mongodb';
import Product from '@/models/Product';

/**
 * Perform BM25-style keyword search in MongoDB
 * Uses MongoDB text search with weighted fields
 * Falls back to regex search if text index is not available
 * 
 * @param query - Search query string
 * @param limit - Maximum number of results (default: 20)
 * @returns Array of products with relevance scores
 */
export async function searchProducts(
    query: string,
    limit: number = 20
): Promise<Array<{ product: any; score: number }>> {
    try {
        await connectDB();

        if (!query || query.trim().length === 0) {
            return [];
        }

        const trimmedQuery = query.trim();

        // Try MongoDB text search first (requires text index)
        try {
            const results = await Product.aggregate([
                {
                    $match: {
                        $text: { $search: trimmedQuery }
                    }
                },
                {
                    $addFields: {
                        score: { $meta: 'textScore' }
                    }
                },
                {
                    $sort: { score: -1 }
                },
                {
                    $limit: limit
                }
            ]);

            if (results.length > 0) {
                console.log(`🔍 Found ${results.length} products via MongoDB text search`);
                return results.map(r => ({
                    product: r,
                    score: r.score || 0
                }));
            }
        } catch (textSearchError) {
            console.warn('Text search failed, falling back to regex search:', textSearchError);
        }

        // Fallback: Regex-based search on name, description, category
        const searchRegex = new RegExp(trimmedQuery.split(' ').join('|'), 'i');

        const results = await Product.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        }).limit(limit).populate('category');

        // Calculate simple relevance score based on field matches
        const scoredResults = results.map(product => {
            let score = 0;
            const queryTerms = trimmedQuery.toLowerCase().split(' ');

            queryTerms.forEach(term => {
                // Name matches get highest weight (3x)
                if (product.name && product.name.toLowerCase().includes(term)) {
                    score += 3;
                }
                // Description matches get medium weight (2x)
                if (product.description && product.description.toLowerCase().includes(term)) {
                    score += 2;
                }
                // Category matches get base weight (1x)
                // Check if category exists and has a name (populated object)
                if (product.category && typeof product.category === 'object' && 'name' in product.category) {
                    if ((product.category as any).name.toLowerCase().includes(term)) {
                        score += 1;
                    }
                } else if (typeof product.category === 'string') {
                    // Fallback for old string data
                    if (product.category.toLowerCase().includes(term)) {
                        score += 1;
                    }
                }
            });

            return {
                product: product.toObject(),
                score: score
            };
        });

        // Sort by score descending
        scoredResults.sort((a, b) => b.score - a.score);

        console.log(`🔍 Found ${scoredResults.length} products via regex search`);

        return scoredResults;
    } catch (error) {
        console.error('Error in BM25 search:', error);
        throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Helper function to create MongoDB text index
 * Run this once to enable text search functionality
 * Can be called from an admin API endpoint or migration script
 */
export async function createTextIndex(): Promise<void> {
    try {
        await connectDB();

        // Create text index with weights
        await Product.collection.createIndex(
            {
                name: 'text',
                description: 'text',
                category: 'text'
            },
            {
                weights: {
                    name: 3,
                    description: 2,
                    category: 1
                },
                name: 'product_text_search'
            }
        );

        console.log('✅ Created text search index on Product collection');
    } catch (error) {
        console.error('Error creating text index:', error);
        throw error;
    }
}
