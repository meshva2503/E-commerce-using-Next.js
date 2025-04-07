import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/utils/auth'; // Import the function

const prisma = new PrismaClient();
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the cart items to set `inCart = false` for this user
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ message: 'Cart cleared successfully' }, { status: 200 });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
