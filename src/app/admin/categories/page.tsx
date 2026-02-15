'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";

interface ICategory {
    _id: string;
    name: string;
    urlKey: string;
    status: 'active' | 'inactive';
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [name, setName] = useState('');
    const [urlKey, setUrlKey] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Fetch categories on load
    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    }

    // Auto-generate slug from name
    const handleNameChange = (val: string) => {
        setName(val);
        // Only auto-update slug if user hasn't manually edited it significantly 
        // OR simply always update it if it matches the easy transformation of the old name
        if (!editingId) {
            const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            setUrlKey(slug);
        }
    };

    const handleEdit = (category: ICategory) => {
        setEditingId(category._id);
        setName(category.name);
        setUrlKey(category.urlKey || '');
        setStatus(category.status || 'active');
        setMessage('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setUrlKey('');
        setStatus('active');
        setMessage('');
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        const isEdit = !!editingId;
        const url = isEdit ? `/api/categories/${editingId}` : '/api/categories';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, urlKey, status }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Category ${isEdit ? 'updated' : 'added'} successfully`);
                handleCancelEdit(); // Reset form
                fetchCategories(); // Refresh list

                // Clear success message after 3 seconds
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.error || `Failed to ${isEdit ? 'update' : 'add'} category`);
            }
        } catch (error) {
            setMessage(`Error ${isEdit ? 'updating' : 'adding'} category`);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchCategories(); // Refresh list
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category', error);
        }
    }

    if (loading) return <p className="p-4">Loading...</p>;

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6 text-[#006A71]">Manage Categories</h1>

                {/* Add/Edit Category Form */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    placeholder="Category Name"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="border p-2 w-full text-black rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL Key (Slug)</label>
                                <input
                                    type="text"
                                    placeholder="url-key"
                                    value={urlKey}
                                    onChange={(e) => setUrlKey(e.target.value)}
                                    className="border p-2 w-full text-black rounded"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                                className="border p-2 w-full text-black rounded"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className={`text-white px-4 py-2 rounded font-medium ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#9ACBD0] hover:bg-[#48A6A7]'}`}
                            >
                                {editingId ? 'Update Category' : 'Add Category'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                    {message && <p className={`mt-2 ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
                </div>

                {/* Categories List */}
                <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl">
                    <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
                    {categories.length === 0 ? (
                        <p className="text-gray-500">No categories found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            URL Key
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat._id} className="text-black">
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{cat.name}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{cat.urlKey || '-'}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${cat.status === 'active' ? 'text-green-900' : 'text-red-900'}`}>
                                                    <span aria-hidden className={`absolute inset-0 ${cat.status === 'active' ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                                                    <span className="relative">{cat.status || 'Active'}</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(cat)}
                                                        className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat._id)}
                                                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
