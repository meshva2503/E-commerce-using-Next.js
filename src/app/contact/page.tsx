'use client';

import { useState,useEffect } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status) {
      timer = setTimeout(() => {
        setStatus('');
      }, 20000); // 60 seconds = 60000 milliseconds
    }
    return () => clearTimeout(timer); // Clean up the timer on unmount or status change
  }, [status]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setStatus('Failed to send message.');
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4 text-center text-black">Contact Us</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-black font-medium">Your Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full text-black"
          required
        />

        <label className="block text-black font-medium">Your Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full text-black"
          required
        />

        <label className="block text-black font-medium">Your Message</label>
        <textarea
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 w-full h-32 text-black"
          required
        ></textarea>

        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Send Message
        </button>
      </form>

      {status && <p className="mt-4 text-center text-green-600">{status}</p>}
    </div>
  );
}
