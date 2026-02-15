'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";

import { useParams } from 'next/navigation';

export default function AdminOrderDetailsPage() {
   const params = useParams();
   const id = typeof params?.id === "string" ? params.id : undefined;
    const [order, setOrder] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await fetch(`/api/admin/orders/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setOrder(data.order);
                    setUser(data.user);
                } else {
                    alert("Order not found");
                    router.push('/admin/orders');
                }
            } catch (error) {
                console.error("Failed to fetch order", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [id, router]);

    if (loading) return <div className="p-10 text-center">Loading order details...</div>;
    if (!order) return null;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto mt-10 bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h1 className="text-2xl font-bold text-[#006A71]">Order Details</h1>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            &larr; Back to Orders
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h2 className="text-lg font-semibold mb-2 text-gray-700">Order Info</h2>
                            <p className="text-gray-600"><span className="font-medium">Order ID:</span> {order._id}</p>
                            <p className="text-gray-600"><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                            <p className="text-gray-600"><span className="font-medium">User ID:</span> {order.userId}</p>
                            {user && (
                                <>
                                    <p className="text-gray-600"><span className="font-medium">User Name:</span> {user.name}</p>
                                    <p className="text-gray-600"><span className="font-medium">User Email:</span> {user.email}</p>
                                </>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-2 text-gray-700">Payment Info</h2>
                            <p className="text-gray-600"><span className="font-medium">Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded text-white text-xs ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </p>
                            <p className="text-gray-600"><span className="font-medium">Payment ID:</span> {order.paymentId || 'N/A'}</p>
                            <p className="text-gray-600 mt-2"><span className="font-medium">Order Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded text-white text-xs ${order.orderStatus === 'Processing' ? 'bg-blue-500' :
                                    order.orderStatus === 'Delivered' ? 'bg-green-600' :
                                        order.orderStatus === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
                                    }`}>
                                    {order.orderStatus || 'Pending'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Order Items</h2>
                    <div className="overflow-x-auto border rounded mb-6">
                        <table className="w-full table-auto text-left">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2">Price</th>
                                    <th className="px-4 py-2">Quantity</th>
                                    <th className="px-4 py-2">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item: any, index: number) => (
                                    <tr key={index} className="border-t">
                                        <td className="px-4 py-2 text-gray-800">{item.name}</td>
                                        <td className="px-4 py-2 text-gray-600">${item.price.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-gray-600">{item.quantity}</td>
                                        <td className="px-4 py-2 text-gray-800 font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded">
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Subtotal:</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Tax:</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold text-lg text-[#006A71]">
                                <span>Total:</span>
                                <span>${order.finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
