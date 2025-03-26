'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');


  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login'); // Redirect if not logged in
      return;
    }

    async function fetchProfile() {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setPhone(data.phone || '');
        setName(data.name || '');
        setEmail(data.email || '');

      }
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  async function handleUpdate() {
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name,email }),
    });

    if (res.ok) {
      alert('Profile updated successfully');
      router.push('/'); // Redirect to home
    }
  }

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">Profile</h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-300 p-2 rounded-full hover:bg-gray-400 text-black"
        >
          ❌
        </button>
      </div>
      {/* <p className="text-black"><strong>Name:</strong> {profile.name}</p> */}
      <label className="block mt-4">
        <span className="text-gray-700 text-black">Name:</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded-md mt-1 text-black"
        />
      </label>
      {/* <p className="text-black"><strong>Email:</strong> {profile.email}</p> */}
      <label className="block mt-4">
        <span className="text-gray-700 text-black">Email:</span>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded-md mt-1 text-black"
        />
      </label>
      <label className="block mt-4">
        <span className="text-gray-700 text-black">Phone Number:</span>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full rounded-md mt-1 text-black"
        />
      </label>
      <button
        onClick={handleUpdate}
        className="mt-4 bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600"
      >
        Update Profile
      </button>
    </div>
  );
}