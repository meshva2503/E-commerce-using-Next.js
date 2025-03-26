'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null); // Separate ref for desktop
  const mobileDropdownRef = useRef<HTMLDivElement>(null); // Separate ref for mobile
  const [profile, setProfile] = useState<any>(null);
  const { isAuthenticated, logout, setIsAuthenticated } = useAuth();
  const router = useRouter();
  const { cart } = useCart();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/check-auth');
      console.log('res:', res);
      setIsAuthenticated(res.ok);
    }
    checkAuth();
  }, []);

  async function handleLogout() {
    await logout();
    setIsAuthenticated(false);
    setDropdownOpen(false); // Explicitly close dropdown on logout
    router.push('/');
  }

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    }
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        (desktopDropdownRef.current && !desktopDropdownRef.current.contains(target)) ||
        (mobileDropdownRef.current && !mobileDropdownRef.current.contains(target))
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-900 text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="text-xl font-bold">
            <Link href="/">MyApp</Link>
          </div>

          {/* Menu Items (Desktop) */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/about" className="hover:text-gray-300">About Us</Link>
            <Link href="/contact" className="hover:text-gray-300">Contact Us</Link>
            <Link href="/products" className="hover:text-gray-300">Products</Link>
            <Link href="/cart" className="hover:text-gray-300">
              🛒 ({isAuthenticated ? cart.length : 0})
            </Link>

            {!isAuthenticated ? (
              <Link href="/login" className="hover:text-blue-500 pl-10">
                Login
              </Link>
            ) : null}

            {isAuthenticated && profile && (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg p-4 z-50">
                    <p className="font-semibold">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <p className="text-sm text-gray-500">{profile.phone || 'No Phone Added'}</p>
                    <Link href="/profile" className="block mt-2 text-blue-500 hover:underline">
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="mt-2 w-full text-left text-red-600 hover:underline"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
          <Link href="/products" className="block py-2 px-4 hover:bg-gray-700">Products</Link>
          <Link href="/cart" className="block py-2 px-4 hover:bg-gray-700">
            🛒 ({cart.length})
          </Link>

          {!isAuthenticated ? (
            <Link href="/login" className="block py-2 px-4 hover:bg-gray-700 text-blue-500">
              Login
            </Link>
          ) : null}

          {isAuthenticated && profile && (
            <div className="relative px-4 py-2" ref={mobileDropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg p-4 z-50">
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  <p className="text-sm text-gray-500">{profile.phone || 'No Phone Added'}</p>
                  <Link href="/profile" className="block mt-2 text-blue-500 hover:underline">
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full text-left text-red-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;