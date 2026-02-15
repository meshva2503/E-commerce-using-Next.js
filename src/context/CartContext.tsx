'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Define the cart context
const CartContext = createContext<any>(null);

// Custom hook to use the CartContext
export function useCart() {
  return useContext(CartContext);
}

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart/get');
      console.log("Resposne:",res.json);
      if (res.ok) {
        const data = await res.json();
        console.log("data:",data);
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart(); // Fetch cart on mount
  }, []);
  async function addToCart(productId: string, quantity: number = 1) {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });
    if (res.ok) {
        fetchCart();
      }
    }
 
    async function removeFromCart(productId: string) {
        const res = await fetch('/api/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
    
        if (res.ok) {
            fetchCart();
        }
    }

    async function updateCartItem(productId: string, newQuantity: number) {
        if (newQuantity < 1) return; // Prevent negative quantity
    
        const res = await fetch('/api/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: newQuantity }),
        });
    
        if (res.ok) {
          fetchCart();
        }
      }
    
      async function clearCart() {
        try {
          const res = await fetch('/api/cart/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
    
          if (res.ok) {
            setCart([]); // Clear cart from state
          }
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      }
    

  return (
    <CartContext.Provider value={{ cart, addToCart , fetchCart,updateCartItem,removeFromCart,clearCart, setCart}}>
      {children}
    </CartContext.Provider>
  );
}
