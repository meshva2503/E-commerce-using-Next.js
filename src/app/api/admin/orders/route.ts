import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ orders }, { status: 200 });
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
