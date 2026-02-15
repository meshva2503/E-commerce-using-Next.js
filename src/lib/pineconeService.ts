import { Pinecone } from '@pinecone-database/pinecone';

// Singleton Pinecone client
let pineconeClient: Pinecone | null = null;

/**
 * Initialize and return Pinecone client (singleton pattern)
 * @returns Pinecone client instance
 */
export function initPinecone(): Pinecone {
    if (pineconeClient) {
        return pineconeClient;
    }

    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
        throw new Error('PINECONE_API_KEY is not defined in environment variables');
    }

    pineconeClient = new Pinecone({
        apiKey: apiKey,
    });

    return pineconeClient;
}

/**
 * Get Pinecone index instance
 * @returns Pinecone index
 */
function getIndex() {
    const indexName = process.env.PINECONE_INDEX_NAME || 'products';
    const pc = initPinecone();
    return pc.index(indexName);
}

/**
 * Upsert (insert or update) a product vector in Pinecone
 * 
 * @param productId - MongoDB product ID (used as vector ID)
 * @param embedding - Embedding vector (1024 dimensions)
 * @param metadata - Product metadata (name, category, price)
 */
export async function upsertProductVector(
    productId: string,
    embedding: number[],
    metadata: {
        name: string;
        category?: string;
        price: number;
    }
): Promise<void> {
    try {
        const index = getIndex();

        // Prepare metadata (Pinecone requires string values for metadata)
        const vectorMetadata: Record<string, string | number> = {
            name: metadata.name,
            price: metadata.price,
        };

        if (metadata.category) {
            vectorMetadata.category = metadata.category;
        }

        // Upsert vector
        console.log(`Upserting to Pinecone for ${productId}. Metadata:`, JSON.stringify(vectorMetadata));
        console.log(`Embedding length: ${embedding.length}`);

        await index.upsert([
            {
                id: productId,
                values: embedding,
                metadata: vectorMetadata,
            },
        ]);

        console.log(`✅ Upserted vector for product: ${productId}`);
    } catch (error) {
        console.error('Error upserting product vector:', error);
        throw new Error(`Failed to upsert vector: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Delete a product vector from Pinecone
 * 
 * @param productId - MongoDB product ID
 */
export async function deleteProductVector(productId: string): Promise<void> {
    try {
        const index = getIndex();

        await index.deleteOne(productId);

        console.log(`✅ Deleted vector for product: ${productId}`);
    } catch (error) {
        console.error('Error deleting product vector:', error);
        // Don't throw error - deletion failure shouldn't block product deletion
        console.warn(`⚠️ Failed to delete vector for product ${productId}, continuing anyway`);
    }
}

/**
 * Search for similar products using vector similarity
 * 
 * @param queryEmbedding - Query embedding vector
 * @param topK - Number of results to return (default: 20)
 * @returns Array of matching product IDs with scores
 */
export async function searchSimilarProducts(
    queryEmbedding: number[],
    topK: number = 20
): Promise<Array<{ id: string; score: number; metadata?: Record<string, any> }>> {
    try {
        const index = getIndex();

        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: topK,
            includeMetadata: true,
        });

        // Map results to simpler format
        const results = (queryResponse.matches || []).map((match: any) => ({
            id: match.id,
            score: match.score || 0,
            metadata: match.metadata,
        }));

        console.log(`🔍 Found ${results.length} similar products via vector search`);

        return results;
    } catch (error) {
        console.error('Error searching similar products:', error);
        throw new Error(`Failed to search vectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
