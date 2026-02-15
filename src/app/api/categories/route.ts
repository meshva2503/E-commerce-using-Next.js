import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find().sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, urlKey, status } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        await connectDB();

        // Generate urlKey from name if not provided (simple slugify)
        let finalUrlKey = urlKey;
        if (!finalUrlKey) {
            finalUrlKey = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const existing = await Category.findOne({ $or: [{ name }, { urlKey: finalUrlKey }] });
        if (existing) {
            return NextResponse.json({ error: 'Category with this name or URL key already exists' }, { status: 400 });
        }

        const category = await Category.create({
            name,
            urlKey: finalUrlKey,
            status: status || 'active'
        });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
