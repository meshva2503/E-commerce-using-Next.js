'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.category as string;

    const [category, setCategory] = useState<any>(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 9;

    const { addToCart } = useCart();

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [slug, currentPage]);

    async function fetchData() {
        try {
            // 1. Fetch Category by slug
            // (Optimize: only fetch category info once if we already have it, but for simplicity/ensure freshness, fetch or check state)
            let catName = category?.name;

            if (!category) {
                const catRes = await fetch(`/api/categories/slug/${slug}`);
                if (!catRes.ok) {
                    throw new Error('Category not found');
                }
                const catData = await catRes.json();
                setCategory(catData);
                catName = catData.name;
            }

            // 2. Fetch Products by Category Name
            const url = `/api/products?page=${currentPage}&limit=${productsPerPage}&category=${encodeURIComponent(catName)}`;
            const res = await fetch(url);
            const data = await res.json();

            setProducts(data.products);
            setTotalPages(Math.ceil(data.total / productsPerPage));
        } catch (error) {
            console.error('Failed to load category data', error);
        } finally {
            setLoading(false);
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && !products.length) return <div className="text-center p-10">Loading...</div>;
    if (!category && !loading) return <div className="text-center p-10">Category not found.</div>;

    return (
        <div className="max-w-5xl mx-auto mt-10 mb-10 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center text-[#006A71]">{category?.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                        <p className="text-gray-500 text-lg">No products found in this category.</p>
                    </div>
                ) : (
                    products.map((product: any) => (
                        <div key={product._id} className="border p-4 rounded-md shadow-md bg-white">
                            <Link href={`/products/${product._id}`}>
                                <img
                                    src={
                                        Array.isArray(product.image) && product.image.length > 0
                                            ? product.image[0]
                                            : product.image || '/placeholder.jpg'
                                    }
                                    alt={product.name}
                                    className="w-full h-60 object-cover rounded-md"
                                />

                                <div className="mt-2 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-black">
                                        <span className="hover:underline">
                                            {product.name}
                                        </span>
                                    </h2>
                                </div>

                                <p className="text-black mt-1 line-clamp-2">{product.description}</p>
                                <p className="font-bold mt-2 text-black">${product.price}</p>
                            </Link>
                            <button
                                onClick={() => addToCart(product._id)}
                                className="mt-3 px-4 py-2 bg-[#48A6A7] text-white rounded-lg hover:bg-[#006A71] w-full"
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded ${currentPage === page
                                ? 'bg-[#48A6A7] text-white'
                                : 'bg-gray-200 text-black hover:bg-gray-300'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
