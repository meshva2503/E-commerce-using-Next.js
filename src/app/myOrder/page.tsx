'use client';

import { useEffect, useState } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

export default function MyOrderHistory() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    async function fetchPaymentDetails() {
      const res = await fetch('/api/user/orders');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setOrders(data.orders);
        console.log("data123", data);
      }
    }
    fetchPaymentDetails();
  }, []);

  const handleOrderAgain = async (orderId, orderItems) => {
    try {
      for (const item of orderItems) {
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error('Failed to add item to cart:', error);
          setMessages((prev) => ({
            ...prev,
            [orderId]: 'Failed to add some items to cart.',
          }));
          return;
        }
      }
      setMessages((prev) => ({
        ...prev,
        [orderId]: 'All items added to cart!',
      }));
    } catch (error) {
      console.error('Error ordering again:', error);
      setMessages((prev) => ({
        ...prev,
        [orderId]: 'An error occurred while ordering again.',
      }));
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-100 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Order History</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No order records found</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-5 mb-4 rounded-lg shadow-md border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-black text-lg">
                  <strong>Order ID:</strong> {order._id}
                </p>
                <p className="text-black">
                  <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-black">
                  <strong>Payment Status:</strong>{' '}
                  <span
                    className={
                      order.paymentStatus === 'Pending' ? 'text-yellow-600' : 'text-green-600'
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-black text-lg font-semibold">
                  <strong>Total:</strong> ${order.finalTotal}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-700">Products Ordered:</h2>
              <ul className="list-disc pl-5 mt-2">
                {order.items.map((item) => (
                  <li key={item._id} className="text-gray-800">
                    {item.name} - ${item.price} x {item.quantity} ={' '}
                    <span className="font-medium">${item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <button
                onClick={() => toggleExpand(order._id)}
                className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {expandedOrder === order._id ? (
                  <>
                    <span className="mr-2">Show Less</span>
                    <FaArrowUp />
                  </>
                ) : (
                  <>
                    <span className="mr-2">Show More</span>
                    <FaArrowDown />
                  </>
                )}
              </button>

              {expandedOrder === order._id && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-800">
                    <strong>Subtotal:</strong> ${order.totalAmount}
                  </p>
                  <p className="text-gray-800">
                    <strong>Tax:</strong> ${order.tax}
                  </p>
                  <p className="text-gray-800 font-semibold">
                    <strong>Final Total:</strong> ${order.finalTotal}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => handleOrderAgain(order._id, order.items)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Order Again
            </button>

            {/* Message specific to this order */}
            {messages[order._id] && (
              <p
                className={`mt-4 text-center ${
                  messages[order._id].includes('error') || messages[order._id].includes('Failed')
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {messages[order._id]}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}