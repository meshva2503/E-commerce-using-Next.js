'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, loading,clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const router = useRouter();
  

  // Calculate Subtotal
  const subtotal = cart.reduce((acc, product) => acc + product.price * product.quantity, 0);
  const tax = subtotal * 0.18; // 18% tax
  const finalTotal = subtotal + tax;

  if (loading) return <p className="text-center text-gray-500">Loading cart...</p>;

  // async function handlePayment() {
  //   console.log("car123:t",cart);
  //   const res = await fetch('/api/payment', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ cart }),
  //   });

  //   const data = await res.json();
  //   if (res.ok) {
  //       clearCart();
  //       router.push('/');
  //       setMessage("Order placed successfully")
  //     } else {
  //       setMessage(data.error || 'Something went wrong');
  //     }
  // }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Shopping Cart</h1>

      {!isAuthenticated ? (
        <p className="text-center text-gray-500">Please log in to view your cart.</p>
      ) : cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty</p>
      ) : (
        <>
          {/* Cart Table */}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left text-black">Product</th>
                <th className="p-3 text-center text-black">Quantity</th>
                <th className="p-3 text-right text-black">Price</th>
                <th className="p-3 text-right text-black">Total</th>
                <th className="p-3 text-right text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((product: any) => (
                <tr key={product.productId} className="border-b border-gray-300">
                  {/* Product Info */}
                  <td className="p-3 flex items-center space-x-4">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md text-black" />
                    <div>
                      <h2 className="text-lg font-semibold text-black">{product.name}</h2>
                      <p className="text-gray-500 text-black">{product.description}</p>
                    </div>
                  </td>

                  {/* Quantity Controls */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <button 
                        className="px-3 py-1 bg-gray-300 rounded-md text-black"
                        onClick={() => updateCartItem(product.productId, product.quantity - 1)}
                      > - </button>
                      <span className="mx-3 text-black">{product.quantity}</span>
                      <button 
                        className="px-3 py-1 bg-gray-300 rounded-md text-black"
                        onClick={() => updateCartItem(product.productId, product.quantity + 1)}
                      > + </button>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-3 text-right text-black">${product.price.toFixed(2)}</td>

                  {/* Total Price for Each Product */}
                  <td className="p-3 text-right text-black">${(product.price * product.quantity).toFixed(2)}</td>

                  {/* Remove Button */} 
                  <td className="p-3 text-right text-black">
                    <button 
                      onClick={() => removeFromCart(product.productId)} 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cart Summary */}
          <div className="mt-6 text-right">
            <p className="text-lg font-semibold text-black">Subtotal: <span className="ml-2">${subtotal.toFixed(2)}</span></p>
            <p className="text-lg font-semibold text-black">Tax (18%): <span className="ml-2">${tax.toFixed(2)}</span></p>
            <p className="text-xl font-bold mt-2 text-black">Final Total: <span className="ml-2">${finalTotal.toFixed(2)}</span></p>

            <button
            onClick={() => router.push('/payment')}
            className="bg-green-500 text-white p-2 w-full"
          >
            Pay Now
          </button>
          </div>

        </>
      )}
    </div>
  );
}
