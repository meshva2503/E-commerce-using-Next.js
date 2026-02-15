import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { getUserIdFromToken } from '@/utils/auth';

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();
    
    await connectDB();

    // Get user ID from token
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Cart.deleteOne({ userId, productId });

    return NextResponse.json({ message: 'Product removed from cart' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
