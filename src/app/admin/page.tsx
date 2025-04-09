'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4 text-[#006A71]">Admin - Welcome</h1>
      </div>
    </div>
  );
}