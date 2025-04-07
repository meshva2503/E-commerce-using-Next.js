import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getUserIdFromToken } from '@/utils/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    // Get user ID from token
    const userId = await getUserIdFromToken(req);
    console.log("userId:",userId);
    const id= userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const cartItems = await Cart.find({ userId });

    const detailedCart = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        return {
          _id: cartItem._id,
          productId: cartItem.productId,
          userId: cartItem.userId,
          cartId: cartItem.cartId,
          quantity: cartItem.quantity,
          addedAt: cartItem.addedAt,
          name: product?.name || "Unknown Product",
          price: product?.price || 0,
          image: product?.image || "/placeholder.jpg",
          description: product?.description || "No description available",
        };
      })
    );

    return NextResponse.json({ cart: detailedCart }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}
