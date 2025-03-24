'use client';

import { useEffect, useState } from 'react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState<number>(0);

    useEffect(() => {
        async function fetchProducts() {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data.products);
        }
        fetchProducts();

        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(cartItems.length);
    }, []);

    function addToCart(product: any) {
        let cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

        // Check if product is already in cart
        const existingItem = cartItems.find((item: any) => item._id === product._id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cartItems));
        setCart(cartItems.length);
    }

    return (
        <div className="max-w-5xl mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center">Products</h1>
            <p className="text-right text-lg font-semibold">
                🛒 Cart: {cart} items
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
                    <div key={product._id} className="border p-4 rounded-md shadow-md">
                        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-md" />
                        <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="font-bold mt-2">${product.price}</p>
                        <button
                            onClick={() => addToCart(product)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
