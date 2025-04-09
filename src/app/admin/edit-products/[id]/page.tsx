'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data.product);
    }

    if (id) fetchProduct();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setNewImages(filesArray);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(previews);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', product!.name);
    formData.append('description', product!.description);
    formData.append('price', String(product!.price));

    newImages.forEach((file) => {
      formData.append('images', file);
    });

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Product updated successfully!');
      setNewImages([]);
      setPreviewUrls([]);
    } else {
      setMessage(data.error || 'Failed to update product.');
    }
  };

  if (!product) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 mt-6">
        <h1 className="text-2xl font-bold text-[#006A71] mb-6">Edit Product</h1>
        {message && <p className="mb-4 text-green-600">{message}</p>}

        <form onSubmit={handleUpdate} encType="multipart/form-data" className="space-y-4 max-w-3xl">
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="border p-2 w-full text-black"
          />
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="border p-2 w-full text-black"
          />
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
            className="border p-2 w-full text-black"
          />

          <div>
            <label className="font-medium block mb-1 text-black">Current Images:</label>
            <div className="flex gap-2 flex-wrap">
              {product.image?.map((img, i) => (
                <img key={i} src={img} alt="Product" className="w-24 h-24 object-cover rounded" />
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-black">Upload New Images:</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-black" />
            {previewUrls.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {previewUrls.map((url, i) => (
                  <img key={i} src={url} alt="Preview" className="w-24 h-24 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-[#48A6A7] text-white px-6 py-2 rounded hover:bg-[#006A71]"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
