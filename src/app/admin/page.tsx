'use client';

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/check-auth');
      if (!res.ok) {
        router.push('/login'); // Redirect to login if not authenticated
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price: Number(price), image }),
    });

    const data = await res.json();
    setMessage(data.message || 'Error adding product');
  }

  
  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Admin - Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Product Name" value={name} 
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <textarea 
          placeholder="Description" value={description} 
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />
        <input 
          type="number" placeholder="Price" value={price} 
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 w-full"
        />
        <input 
          type="text" placeholder="Image URL" value={image} 
          onChange={(e) => setImage(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Add Product
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
