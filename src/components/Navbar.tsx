'use client';

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            <Link href="/login" className='hover:text-blue-500 pl-[10rem]'>Login</Link>
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
          <Link href="/login" className='hover:text-blue-500 pl-[10rem]'>Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
