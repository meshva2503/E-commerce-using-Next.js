import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/utils/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';

export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's payment & order details
    const payments = await Payment.find({ userId });
    const orders = await Order.find({ userId });

    return NextResponse.json({ payments, orders }, { status: 200 });
  } catch (error) {
    console.error('Fetch Payment Details Error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 500 });
  }
}
