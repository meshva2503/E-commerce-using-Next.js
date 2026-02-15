'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminPage() {

  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#006A71]">Admin Dashboard</h1>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

          <div className="flex flex-col gap-4">
            <div className="border p-4 rounded-md bg-gray-50">
              <h3 className="font-medium text-lg mb-2">Initialize Sample Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Populate your database with rich sample products to test Search and Recommendations.
                <br />
                <span className="text-xs text-orange-600 font-semibold">Note: Existing products with same names will be skipped.</span>
              </p>

              <button
                onClick={async () => {
                  if (!confirm('This will add sample products to your database. Continue?')) return;
                  try {
                    alert('Seeding started... this may take a few seconds.');
                    const res = await fetch('/api/admin/seed', { method: 'POST' });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`Success! Added: ${data.results.added}, Failed: ${data.results.failed}`);
                    } else {
                      alert('Failed: ' + data.error);
                    }
                  } catch (err) {
                    alert('Error calling seed API');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                🌱 Seed Sample Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}