import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const order = await Order.findById(params.id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch user details
        const user = await User.findById(order.userId).select('name email');

        return NextResponse.json({ order, user }, { status: 200 });
    } catch (error) {
        console.error('Error fetching order details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order details' },
            { status: 500 }
        );
    }
}
