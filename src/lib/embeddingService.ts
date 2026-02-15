import { initPinecone } from './pineconeService';

/**
 * Generate embedding vector for given text using Pinecone Inference
 * Uses llama-text-embed-v2 model which generates 1024-dimensional vectors
 * 
 * @param text - Input text to generate embedding for
 * @param inputType - 'passage' for documents, 'query' for search queries
 * @returns Float32Array of 1024 dimensions
 */
export async function generateEmbedding(
    text: string,
    inputType: 'passage' | 'query' = 'passage'
): Promise<number[]> {

    if (!text || !text.trim()) {
        throw new Error("Empty text for embedding");
    }

    const pc = initPinecone();

    try {
        const result = await pc.inference.embed(
            'llama-text-embed-v2',
            [text],
            { inputType }
        );

        console.log("Raw embedding response:", result);

        const embedding = result?.data?.[0]?.values;

        if (!embedding) {
            throw new Error("Embedding not returned from Pinecone");
        }

        console.log("Embedding size:", embedding.length);

        return embedding;

    } catch (error) {
        console.error("Embedding error:", error);
        throw error;
    }
}



/**
 * Generate embedding for a product by combining name, description, and category
 * 
 * @param product - Product object with name, description, and optional category
 * @returns Float32Array embedding vector
 */
export async function generateProductEmbedding(product: {
    name: string;
    description: string;
    category?: string;
}): Promise<number[]> {
    // Combine product fields into a single text for embedding
    // Format: "name. description. Category: category"
    const textParts = [
        product.name,
        product.description,
    ];

    if (product.category) {
        textParts.push(`Category: ${product.category}`);
    }

    const combinedText = textParts.join('. ');

    return generateEmbedding(combinedText, 'passage');
}
