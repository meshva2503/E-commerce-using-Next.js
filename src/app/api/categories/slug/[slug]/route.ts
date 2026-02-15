import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const { slug } = await params;
        const category = await Category.findOne({ urlKey: slug });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}
