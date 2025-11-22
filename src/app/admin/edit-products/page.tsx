'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";


interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}

export default function EditProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchProducts() {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data.products);
        }
        fetchProducts();
    }, []);

    const handleInputChange = (id: string, field: keyof Product, value: string | number) => {
        setProducts((prev) =>
            prev.map((product) =>
                product._id === id ? { ...product, [field]: value } : product
            )
        );
    };

    const handleSave = async (product: Product) => {
        try {
            const res = await fetch(`/api/products/${product._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`Product "${product.name}" updated successfully.`);
            } else {
                setMessage(data.error || 'Failed to update product.');
            }
        } catch (err) {
            setMessage('Server error while updating product.');
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar on the left */}
            <AdminSidebar />
            {/* Form content on the right */}
            <div className="flex-1 p-4">
                <div className="max-w-5xl mx-auto p-6 mt-10">
                    <h1 className="text-3xl font-bold text-center text-[#006A71] mb-6">Edit Products</h1>

                    {message && <p className="text-green-600 text-center mb-4">{message}</p>}

                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="border p-4 rounded-md mb-6 shadow-sm bg-white"
                        >
                            <div className="flex gap-4">
                                <img
                                    src={
                                        Array.isArray(product.image) && product.image.length > 0
                                            ? product.image[0]
                                            : product.image || '/placeholder.jpg'
                                    }
                                    alt={product.name}
                                    className="w-28 h-28 object-cover rounded-md"
                                />
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => handleInputChange(product._id, 'name', e.target.value)}
                                        className="w-full border p-2 text-black"
                                    />
                                    <textarea
                                        value={product.description}
                                        onChange={(e) => handleInputChange(product._id, 'description', e.target.value)}
                                        className="w-full border p-2 text-black"
                                    />
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => handleInputChange(product._id, 'price', Number(e.target.value))}
                                        className="w-full border p-2 text-black"
                                    />
                                    <button
                                        onClick={() => handleSave(product)}
                                        className="bg-[#48A6A7] text-white px-4 py-2 rounded hover:bg-[#006A71]"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >

    );
}
