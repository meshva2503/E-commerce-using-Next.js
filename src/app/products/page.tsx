'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products);
    }
    fetchProducts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 mb-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#006A71]">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div key={product._id} className="border p-4 rounded-md shadow-md ">
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
          
            <h2 className="text-xl font-semibold mt-2 text-black"> <Link href={`/products/${product._id}`} className="hover:underline">{product.name}</Link></h2>
            <p className="text-black">{product.description}</p>
            <p className="font-bold mt-2 text-black">${product.price}</p>
            </Link>
            <button
              onClick={() => addToCart(product._id)}
              className="mt-3 px-4 py-2 bg-[#48A6A7] text-white rounded-lg hover:bg-[#006A71]"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
