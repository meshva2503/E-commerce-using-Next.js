import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { getUserIdFromToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { productId, quantity  } = await req.json();


        await connectDB();

        // Get user ID from token
        const userId = await getUserIdFromToken(req);
        console.log ("userId:",userId);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cartId = `cart_${userId}`;

        // Check if product is already in cart
        const existingItem = await Cart.findOne({ userId, productId });

        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
        } else {
            await Cart.create({ userId, cartId, productId, quantity });
        }

        return NextResponse.json({ message: 'Product added to cart' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
    }
}
