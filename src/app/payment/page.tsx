'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function PaymentPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxAmount = totalAmount * 0.18;
  const finalTotal = totalAmount + taxAmount;

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!cardNumber || !cvv || !password) {
      setError('All fields are required');
      return;
    }

    const res = await fetch('/api/payment/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardNumber,
        cvv,
        password,
        cartItems: cart,
        totalAmount: totalAmount,
        finalTotal:finalTotal ,
        tax:taxAmount,
        createdAt: new Date().toISOString()
      }),
    });

    const data = await res.json();
    if (res.ok) {
      // clearCart();
      router.push('/order-success'); // Redirect after payment
    } else {
      setError(data.error || 'Payment failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4 text-black">Payment Details</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handlePayment} className="space-y-4">
        <input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className="border p-2 w-full text-black"
          required
        />
        <input
          type="password"
          placeholder="Card Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full text-black"
          required
        />
        <input
          type="text"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          className="border p-2 w-full text-black"
          required
        />
        <p className="font-bold text-black">Total: ${finalTotal.toFixed(2)}</p>
        <button type="submit" className="bg-[#9ACBD0] text-white p-2 w-full hover:bg-[#48A6A7]">
          Pay Now
        </button>
      </form>
    </div>
  );
}
