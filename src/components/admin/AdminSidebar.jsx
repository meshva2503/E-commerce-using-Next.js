'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
  ];


  const isProductsActive = pathname.startsWith('/admin/edit-products') || pathname === '/admin/add-product' || pathname === '/admin/products';

  return (
    <div className="flex min-h-screen">
      <div className="w-64 h-screen bg-[#F0F4F8] border-r border-gray-200 sticky top-0 left-0 overflow-hidden">
        <Link href="/admin">
          <h2 className="text-xl font-bold mb-6 p-4 text-[#006A71]">Admin Panel</h2>
        </Link>
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive =
              link.href === '/admin/products'
                ? isProductsActive 
                : pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block p-2 px-4 rounded hover:bg-[#DCEEF1] text-black ${
                    isActive ? 'bg-[#DCEEF1] font-medium' : ''
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}