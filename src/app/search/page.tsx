'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInfo, setSearchInfo] = useState<any>(null);
    const { addToCart } = useCart();

    // Debounced search effect or just on submit? 
    // User requested "search the query and then shows the product", implies interactive or submit.
    // I'll adhere to "submit" or "type" but given it's a dedicated page, search-on-type with debounce is nice, 
    // but typically a dedicated search page expects explicit action or pre-filled query.
    // I'll make it reactive to the URL, so input changes URL, which triggers fetch.

    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    async function handleSearch(searchTerm: string) {
        if (!searchTerm.trim()) {
            setResults([]);
            setSearchInfo(null);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();

            if (res.ok) {
                setResults(data.results);
                setSearchInfo(data.searchMethods);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    }

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const getMatchTypeBadge = (matchType: string) => {
        switch (matchType) {
            case 'hybrid':
                return <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-200">🎯 Hybrid Match</span>;
            case 'keyword':
                return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200">🔤 Keyword</span>;
            case 'semantic':
                return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">🧠 AI Match</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-[#006A71] mb-4">AI-Powered Search</h1>
                <p className="text-gray-600 mb-8">Find exactly what you're looking for with our hybrid search engine.</p>

                <form onSubmit={onSearchSubmit} className="max-w-2xl mx-auto relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Describe what you want (e.g., 'summer floral dress for wedding')"
                        className="w-full px-6 py-4 rounded-full border-2 border-[#9ACBD0] focus:border-[#48A6A7] focus:outline-none shadow-sm text-lg text-black pr-12"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#48A6A7] text-white rounded-full hover:bg-[#006A71] transition-colors"
                    >
                        <Search size={24} />
                    </button>
                </form>

                {searchInfo && (
                    <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
                        <span title="Keyword Matches">🔤 {searchInfo.bm25Count} BM25</span>
                        <span title="Semantic AI Matches">🧠 {searchInfo.vectorCount} Vector</span>
                        <span title="Results found by both">🎯 {searchInfo.hybridCount} Hybrid</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#48A6A7]"></div>
                </div>
            ) : (
                <>
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.map((product: any) => (
                                <div key={product._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                    <Link href={`/products/${product._id}`} className="block relative group">
                                        <div className="h-64 overflow-hidden bg-gray-100">
                                            <img
                                                src={
                                                    Array.isArray(product.image) && product.image.length > 0
                                                        ? product.image[0]
                                                        : product.image || '/placeholder.jpg'
                                                }
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            {getMatchTypeBadge(product.matchType)}
                                        </div>
                                    </Link>

                                    <div className="p-4 flex-grow flex flex-col">
                                        <Link href={`/products/${product._id}`}>
                                            <h3 className="font-semibold text-lg text-gray-800 mb-1 hover:text-[#006A71] line-clamp-1">{product.name}</h3>
                                        </Link>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-grow">{product.description}</p>

                                        <div className="mt-auto">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-xl text-[#006A71]">${product.price}</span>
                                                {product.score > 0 && (
                                                    <span className="text-xs text-gray-400" title="Relevance Score">Score: {product.score}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => addToCart(product._id)}
                                                className="w-full py-2 bg-[#48A6A7] text-white rounded hover:bg-[#006A71] transition-colors font-medium"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        initialQuery && !loading && (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-xl text-gray-600">No results found for "{initialQuery}"</p>
                                <p className="text-gray-500 mt-2">Try checking your spelling or using different keywords.</p>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
