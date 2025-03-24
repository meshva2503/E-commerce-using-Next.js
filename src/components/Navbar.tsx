'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/check-auth'); // API to verify JWT
      setIsAuthenticated(res.ok);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cartItems.length);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/login'); // Redirect after logout
  }

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="text-xl font-bold">
            <Link href="/">MyApp</Link>
          </div>

          {/* Menu Items (Desktop) */}
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/about" className="hover:text-gray-300">About Us</Link>
            <Link href="/contact" className="hover:text-gray-300">Contact Us</Link>
            <Link href="/products" className="hover:text-gray-300">Products</Link>
            <Link href="/cart" className="hover:text-gray-300">
              🛒 Cart ({cartCount})
            </Link>

            {isAuthenticated ? (
              <button onClick={handleLogout} className="hover:text-red-500 pl-10">
                Logout
              </button>
            ) : (
              <Link href="/login" className="hover:text-blue-500 pl-10">
                Login
              </Link>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              {isOpen ? '✖' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800">
          <Link href="/" className="block py-2 px-4 hover:bg-gray-700">Home</Link>
          <Link href="/about" className="block py-2 px-4 hover:bg-gray-700">About Us</Link>
          <Link href="/contact" className="block py-2 px-4 hover:bg-gray-700">Contact Us</Link>
          <Link href="/products" className="hover:text-gray-300">Products</Link>

          {isAuthenticated ? (
            <button onClick={handleLogout} className="block py-2 px-4 text-red-500 hover:bg-gray-700">
              Logout
            </button>
          ) : (
            <Link href="/login" className="block py-2 px-4 text-blue-500 hover:bg-gray-700">
              Login
            </Link>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;
