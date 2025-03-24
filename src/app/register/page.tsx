'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router=  useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok){
        setMessage(data.message);
        router.push("/login");
    }
    else {
        setMessage(data.error);
    }
   
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Name" value={name} 
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <input 
          type="email" placeholder="Email" value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
        <input 
          type="password" placeholder="Password" value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Register
        </button>
      </form>
      <p className='mt-[1rem]'>Already have an account? <span className='hover:text-blue-500 hover:underline '><Link href="/login">Login</Link></span></p>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
