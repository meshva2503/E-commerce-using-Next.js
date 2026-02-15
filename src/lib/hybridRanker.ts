/**
 * Hybrid ranking algorithm that merges BM25 keyword search results
 * and semantic vector search results into a single ranked list
 */

interface BM25Result {
    product: any;
    score: number;
}

interface VectorResult {
    id: string;
    score: number;
    metadata?: Record<string, any>;
}

interface HybridResult {
    product: any;
    score: number;
    matchType: 'hybrid' | 'keyword' | 'semantic';
}

/**
 * Normalize scores to 0-1 range
 * @param scores - Array of scores
 * @returns Normalized scores
 */
function normalizeScores(scores: number[]): number[] {
    if (scores.length === 0) return [];

    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Avoid division by zero
    if (maxScore === minScore) {
        return scores.map(() => 1);
    }

    return scores.map(score => (score - minScore) / (maxScore - minScore));
}

/**
 * Merge and rank results from BM25 and vector search
 * 
 * Scoring strategy:
 * - Products in both results: (bm25_score * 0.4) + (vector_score * 0.6) + boost(0.2)
 * - Products in BM25 only: bm25_score * 0.4
 * - Products in vector only: vector_score * 0.6
 * 
 * @param bm25Results - Results from keyword search
 * @param vectorResults - Results from semantic search
 * @param productMap - Map of product IDs to full product objects (from MongoDB)
 * @returns Merged and ranked results
 */
export function mergeAndRank(
    bm25Results: BM25Result[],
    vectorResults: VectorResult[],
    productMap: Map<string, any>
): HybridResult[] {
    // Normalize BM25 scores
    const bm25Scores = bm25Results.map(r => r.score);
    const normalizedBM25 = normalizeScores(bm25Scores);

    // Use raw vector scores (Cosine similarity is already 0-1 and absolute relevance matters)
    // Normalizing them would force the "best of the worst" to 1.0, which is bad.
    const normalizedVector = vectorResults.map(r => r.score);

    // Create maps for quick lookup
    const bm25Map = new Map<string, number>();
    bm25Results.forEach((result, index) => {
        const productId = result.product._id.toString();
        bm25Map.set(productId, normalizedBM25[index] || 0);
    });

    const vectorMap = new Map<string, number>();
    vectorResults.forEach((result, index) => {
        vectorMap.set(result.id, normalizedVector[index] || 0);
    });

    // Get all unique product IDs
    const allProductIds = new Set<string>([
        ...bm25Results.map(r => r.product._id.toString()),
        ...vectorResults.map(r => r.id)
    ]);

    // Calculate hybrid scores
    const hybridResults: HybridResult[] = [];

    allProductIds.forEach(productId => {
        const bm25Score = bm25Map.get(productId) || 0;
        const vectorScore = vectorMap.get(productId) || 0;

        let finalScore = 0;
        let matchType: 'hybrid' | 'keyword' | 'semantic' = 'keyword';

        if (bm25Score > 0 && vectorScore > 0) {
            // Product found in both - highest confidence
            finalScore = (bm25Score * 0.4) + (vectorScore * 0.6) + 0.2; // 20% boost
            matchType = 'hybrid';
        } else if (bm25Score > 0) {
            // Keyword match only
            finalScore = bm25Score * 0.4;
            matchType = 'keyword';
        } else {
            // Semantic match only
            finalScore = vectorScore * 0.6;
            matchType = 'semantic';
        }

        // Get full product object
        const product = productMap.get(productId);

        if (product) {
            hybridResults.push({
                product,
                score: finalScore,
                matchType
            });
        }
    });

    // Sort by score descending
    hybridResults.sort((a, b) => b.score - a.score);

    console.log(`🎯 Hybrid ranking complete: ${hybridResults.length} total results`);
    console.log(`   - Hybrid matches: ${hybridResults.filter(r => r.matchType === 'hybrid').length}`);
    console.log(`   - Keyword only: ${hybridResults.filter(r => r.matchType === 'keyword').length}`);
    console.log(`   - Semantic only: ${hybridResults.filter(r => r.matchType === 'semantic').length}`);

    return hybridResults;
}
