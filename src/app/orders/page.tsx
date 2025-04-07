'use client';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    }
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 ">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-black">No orders placed yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="border p-4 rounded-md shadow-md text-black">
              <p className="font-bold">Order ID: {order._id}</p>
              <p>Total: ${order.finalTotal.toFixed(2)}</p>
              <p>Payment Status: {order.paymentStatus}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
