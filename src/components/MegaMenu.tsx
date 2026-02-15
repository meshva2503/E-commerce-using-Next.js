'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ICategory {
    _id: string;
    name: string;
    urlKey: string;
}

export default function MegaMenu({ closeMenu }: { closeMenu?: () => void }) {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) setCategories(await res.json());
            } catch {
                console.error('Failed to load categories');
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    if (loading) {
        return <div className="bg-white p-6">Loading...</div>;
    }

    return (
        <div className="bg-white text-black shadow-xl border-t-4 border-[#006A71] p-6 rounded-b-lg">
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <h3 className="font-bold mb-4 text-[#006A71]">Shop by Category</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {categories.map(cat => (
                            <Link
                                key={cat._id}
                                href={`/${cat.urlKey}`}
                                onClick={closeMenu}
                                className="p-2 hover:bg-[#E0F7FA] rounded"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="border-l pl-6">
                    <h3 className="font-bold mb-4 text-[#006A71]">New Arrivals</h3>
                    <p className="text-sm mb-3">Check our latest products</p>
                    <Link
                        href="/products"
                        className="inline-block bg-[#48A6A7] text-white px-4 py-2 rounded"
                        onClick={closeMenu}
                    >
                        View All
                    </Link>
                </div>
            </div>
        </div>
    );
}
