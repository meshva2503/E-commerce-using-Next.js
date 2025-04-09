'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Array to store multiple files
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Array for preview URLs
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/check-auth');
      if (!res.ok) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setImageFiles(filesArray);

      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);

    imageFiles.forEach((file) => {
      formData.append('images', file); // Use 'images' as the key for multiple files
    });

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || data.error);

      if (res.ok) {
        setName('');
        setDescription('');
        setPrice('');
        setImageFiles([]);
        setPreviewUrls([]);
      }
    } catch (error) {
      setMessage('Error uploading product');
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <AdminSidebar />
      <div className="flex-1 p-4">
        <div className="max-w-lg mx-auto mt-10">
          <h1 className="text-2xl font-bold mb-4 text-[#006A71]">Admin - Add Product</h1>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full text-black"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full text-black"
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 w-full text-black"
            />
            <div>
              <input
                type="file"
                accept="image/*"
                multiple // Allow multiple file selection
                onChange={handleImageChange}
                className="border p-2 w-full text-black"
              />
              {previewUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index}`}
                      className="max-w-xs w-24 h-24 object-contain"
                    />
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="bg-[#9ACBD0] hover:bg-[#48A6A7] text-white p-2 w-full">
              Add Product
            </button>
          </form>
          {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}