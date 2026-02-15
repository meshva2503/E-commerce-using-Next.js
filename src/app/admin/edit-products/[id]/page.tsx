'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category?: string | { _id: string; name: string };
}

interface ICategory {
  _id: string;
  name: string;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [message, setMessage] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/categories')
        ]);

        if (productRes.ok) {
          const data = await productRes.json();
          // Ensure image is always an array
          const prod = data.product;
          if (prod && !Array.isArray(prod.image)) {
            prod.image = prod.image ? [prod.image] : [];
          }
          setProduct(prod);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch data');
      }
    }

    if (id) fetchData();
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

  const handleDeleteExistingImage = (index: number) => {
    if (!product) return;
    const updatedImages = product.image.filter((_, i) => i !== index);
    setProduct({ ...product, image: updatedImages });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', product!.name);
    formData.append('description', product!.description);
    formData.append('price', String(product!.price));

    // Send existing images as JSON string
    formData.append('existingImages', JSON.stringify(product!.image));

    if (product?.category) {
      const categoryValue = typeof product.category === 'object' ? (product.category as any).name : product.category;
      formData.append('category', categoryValue);
    }

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

          {/* Category Dropdown */}
          <select
            value={typeof product.category === 'object' ? (product.category as any).name : product.category || ''}
            onChange={(e) => setProduct({ ...product!, category: e.target.value })}
            className="border p-2 w-full text-black bg-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-sm text-gray-500">
              No categories found. <a href="/admin/categories" className="text-blue-600 hover:underline">Create a category first</a>.
            </p>
          )}

          <div>
            <label className="font-medium block mb-1 text-black">Current Images:</label>
            <div className="flex gap-4 flex-wrap">
              {product.image?.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="Product" className="w-24 h-24 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(!product.image || product.image.length === 0) && (
                <p className="text-gray-500 italic text-sm">No images currently uploaded.</p>
              )}
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-black">Upload New Images:</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-black" />
            {previewUrls.length > 0 && (
              <div className="mt-2 flex gap-4 flex-wrap">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="Preview" className="w-24 h-24 object-cover rounded border-2 border-dashed border-gray-400" />
                  </div>
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
