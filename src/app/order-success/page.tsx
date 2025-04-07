'use client';

import Link from 'next/link';

export default function OrderSuccess() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-lg mb-6">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}