'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import MegaMenu from './MegaMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const { isAuthenticated, logout, setIsAuthenticated } = useAuth();
  const router = useRouter();
  const { cart, setCart } = useCart();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/check-auth');
      setIsAuthenticated(res.ok);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, [setCart]);

  async function handleLogout() {
    await logout();
    setIsAuthenticated(false);
    setDropdownOpen(false);
    setIsOpen(false);
    router.push('/');
  }

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/user/profile');
      if (res.ok) setProfile(await res.json());
    }
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  // ✅ Close USER dropdown on outside click (desktop + mobile)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#48A6A7] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* LOGO */}
          <Link href="/" className="text-xl font-bold">
            MyApp
          </Link>

          {/* ================= DESKTOP MENU ================= */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:border-b-2 border-[#006A71]">
              Home
            </Link>

            {/* ===== MEGA MENU ===== */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                className={`py-5 flex items-center gap-1 ${megaMenuOpen ? 'border-b-2 border-[#006A71]' : ''
                  }`}
              >
                Shop ▾
              </button>

              {megaMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[750px]">
                  <MegaMenu closeMenu={() => setMegaMenuOpen(false)} />
                </div>
              )}
            </div>

            <Link href="/search" className="hover:border-b-2 border-[#006A71] font-semibold text-[#9ACBD0] bg-white px-3 py-1 rounded-full hover:bg-gray-100 transition-colors">
              ✨ AI Search
            </Link>

            <Link href="/about" className="hover:border-b-2 border-[#006A71]">
              About
            </Link>

            <Link href="/contact" className="hover:border-b-2 border-[#006A71]">
              Contact
            </Link>

            <Link href="/cart">🛒 ({isAuthenticated ? cart.length : 0})</Link>

            {!isAuthenticated && <Link href="/login">Login</Link>}

            {isAuthenticated && profile && (
              <div ref={desktopDropdownRef} className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}>👤</button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black p-4 rounded shadow">
                    <p className="font-semibold">{profile.name}</p>
                    <p className="text-sm">{profile.email}</p>

                    <Link href="/profile" className="block mt-2 text-blue-600">
                      Profile
                    </Link>

                    <Link href="/myOrder" className="block mt-2 text-blue-600">
                      My Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mt-2 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= MOBILE TOGGLE ================= */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isOpen && (
        <div className="md:hidden bg-[#48A6A7] border-t">
          <Link
            href="/"
            className="block px-4 py-3 hover:bg-[#006A71]"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/products"
            className="block px-4 py-3 hover:bg-[#006A71] font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Shop All Products
          </Link>

          <Link
            href="/search"
            className="block px-4 py-3 hover:bg-[#006A71] font-bold text-yellow-300"
            onClick={() => setIsOpen(false)}
          >
            ✨ AI Search
          </Link>

          <Link
            href="/about"
            className="block px-4 py-3 hover:bg-[#006A71]"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>

          <Link
            href="/contact"
            className="block px-4 py-3 hover:bg-[#006A71]"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>

          <Link
            href="/cart"
            className="block px-4 py-3 hover:bg-[#006A71]"
            onClick={() => setIsOpen(false)}
          >
            🛒 ({cart.length})
          </Link>

          {!isAuthenticated && (
            <Link
              href="/login"
              className="block px-4 py-3 text-blue-200"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}

          {isAuthenticated && profile && (
            <div ref={mobileDropdownRef} className="px-4 py-3 border-t">
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm opacity-80">{profile.email}</p>

              <Link
                href="/profile"
                className="block mt-2 text-blue-200"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>

              <Link
                href="/myOrder"
                className="block mt-1 text-blue-200"
                onClick={() => setIsOpen(false)}
              >
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="block mt-2 text-red-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
