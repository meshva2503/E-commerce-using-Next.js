'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useRouter } from 'next/navigation';

export default function ProductTablePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchProducts() {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data.products);
        }
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p._id !== id));
            alert('Product deleted.');
        } else {
            alert('Failed to delete product.');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar on the left */}
            <div className="w-64 flex-shrink-0">
                <AdminSidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto mt-10">
                    <h1 className="text-3xl font-bold mb-6 text-[#006A71] text-center">All Products</h1>

                    <button
                        onClick={() => router.push('/admin/add-product')}
                        className="w-[60px] text-center px-4 py-2 text-black text-sm bg-red-400 hover:bg-red-600 rounded-md ml-[65rem] mb-[14px] transition-colors duration-200"
                    >
                        Add
                    </button>

                    <div className="overflow-x-auto border rounded shadow bg-white">
                        <table className="w-full table-auto text-left">
                            <thead className="bg-[#F3F4F6] text-[#333]">
                                <tr>
                                    <th className="px-4 py-2">Sr. No</th>
                                    <th className="px-4 py-2">Image</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Price</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product._id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-2 text-black">{index + 1}</td>
                                        <td className="px-4 py-2">
                                            <img
                                                src={
                                                    Array.isArray(product.image) && product.image.length > 0
                                                        ? product.image[0]
                                                        : product.image || '/placeholder.jpg'
                                                }
                                                alt={product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-black">{product.name}</td>
                                        <td className="px-4 py-2 font-semibold text-black">${product.price}</td>
                                        <td className="px-4 py-2 relative">
                                            <button
                                                onClick={() =>
                                                    setActiveDropdown(activeDropdown === product._id ? null : product._id)
                                                }
                                                className="bg-[#9ACBD0] px-3 py-1 rounded hover:bg-[#7BA8AC] text-sm transition-colors duration-200"
                                            >
                                                ⋮
                                            </button>

                                            {activeDropdown === product._id && (
                                                <div className="absolute bg-white border rounded shadow-lg mt-1 right-0 z-10 w-28">
                                                    <Link
                                                        href={`/admin/edit-products/${product._id}`}
                                                        className="block px-4 py-2 hover:bg-gray-100 text-sm transition-colors duration-200 text-black"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-6 text-gray-500">
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}