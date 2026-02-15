import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { getUserIdFromToken } from '@/utils/auth';

export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json();
    
    await connectDB();

    // Get user ID from token
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update quantity of the cart item
    await Cart.findOneAndUpdate({ userId, productId }, { quantity });

    return NextResponse.json({ message: 'Cart updated successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
