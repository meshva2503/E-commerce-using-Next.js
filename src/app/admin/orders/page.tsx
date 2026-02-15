'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch('/api/admin/orders');
                const data = await res.json();
                if (res.ok) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading orders...</div>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto mt-10">
                    <h1 className="text-3xl font-bold mb-6 text-[#006A71] text-center">All Orders</h1>

                    <div className="overflow-x-auto border rounded shadow bg-white">
                        <table className="w-full table-auto text-left">
                            <thead className="bg-[#F3F4F6] text-[#333]">
                                <tr>
                                    <th className="px-4 py-2">Order ID</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Total</th>
                                    <th className="px-4 py-2">Payment Status</th>
                                    <th className="px-4 py-2">Order Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-2 text-black text-sm">{order._id}</td>
                                        <td className="px-4 py-2 text-black text-sm">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 font-semibold text-black text-sm">
                                            ${order.finalTotal.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`px-2 py-1 rounded text-white text-xs ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`px-2 py-1 rounded text-white text-xs ${order.orderStatus === 'Processing' ? 'bg-blue-500' :
                                                    order.orderStatus === 'Delivered' ? 'bg-green-600' :
                                                        order.orderStatus === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
                                                }`}>
                                                {order.orderStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="bg-[#006A71] text-white px-3 py-1 rounded hover:bg-[#004d52] text-sm transition-colors duration-200"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-6 text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
