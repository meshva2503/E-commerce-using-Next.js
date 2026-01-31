import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/utils/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Cart from '@/models/Cart';

export async function POST(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, cartItems, totalAmount, finalTotal, tax, createdAt } = await req.json();

    if (!paymentId || !cartItems.length) {
      return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
    }

    const orderData = {
      userId,
      totalAmount,
      finalTotal,
      tax,
      paymentStatus: 'Paid',
      paymentId,
      orderStatus: 'Processing',
      items: cartItems.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    console.log('Creating order with data:', orderData);
    const order = await Order.create(orderData);
    console.log('Order created:', order.toObject());

    await Payment.create({
      userId,
      orderId: order._id,
      paymentId,
      amount: finalTotal,
      status: 'Success'
    });

    // Clear user's cart
    await Cart.deleteMany({ userId });

    return NextResponse.json({ message: 'Payment successful', orderId: order._id }, { status: 200 });
  } catch (error) {
    console.error('Payment Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: `Payment processing failed: ${errorMessage}` }, { status: 500 });
  }
}
