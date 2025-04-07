import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/utils/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Cart from '@/models/Cart'; // Assuming a Cart model exists

export async function POST(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardNumber, cvv, password, cartItems, totalAmount , finalTotal,tax ,createdAt   } = await req.json();

    if (!cardNumber || !cvv || !password || !cartItems.length) {
      return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
    }

    // Save order details
    const order = await Order.create({
      userId,
      totalAmount,
      finalTotal,
      tax,
      createdAt,
      items: cartItems.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    await Payment.create({
      userId,
      orderId: order._id,
      cardNumber: `**** **** **** ${cardNumber.slice(-4)}`, // Masked card number
      cvv: '***', // Mask CVV
    });

    // Clear user's cart
    await Cart.deleteMany({ userId });

    return NextResponse.json({ message: 'Payment successful', orderId: order._id }, { status: 200 });
  } catch (error) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
