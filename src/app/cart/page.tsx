'use client';

import { useEffect, useState } from 'react';

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartItems);
  }, []);

  function removeFromCart(productId: string) {
    let cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    cartItems = cartItems.filter((item: any) => item._id !== productId);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCart(cartItems);
  }

  function updateQuantity(productId: string, quantity: number) {
    let cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    cartItems = cartItems.map((item: any) =>
      item._id === productId ? { ...item, quantity } : item
    );
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCart(cartItems);
  }

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cart.map((product: any) => (
            <div key={product._id} className="border p-4 rounded-md shadow-md">
              <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded-md" />
              <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
              <p className="text-gray-600">{product.description}</p>
              <p className="font-bold mt-2">${product.price}</p>

              {/* Quantity Selector */}
              <div className="flex items-center mt-3">
                <button 
                  className="px-3 py-1 bg-gray-300 rounded-md"
                  onClick={() => updateQuantity(product._id, Math.max(1, product.quantity - 1))}
                > - </button>
                <span className="mx-3">{product.quantity}</span>
                <button 
                  className="px-3 py-1 bg-gray-300 rounded-md"
                  onClick={() => updateQuantity(product._id, product.quantity + 1)}
                > + </button>
              </div>

              {/* Remove Button */}
              <button 
                onClick={() => removeFromCart(product._id)} 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
