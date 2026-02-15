import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { name, urlKey, status } = await req.json();
        await connectDB();

        let finalUrlKey = urlKey;
        if (!finalUrlKey && name) {
            finalUrlKey = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        // Check if other category has same name or urlKey
        // We use $ne to exclude the current category from the check
        if (name || finalUrlKey) {
            const existing = await Category.findOne({
                _id: { $ne: id },
                $or: [
                    ...(name ? [{ name }] : []),
                    ...(finalUrlKey ? [{ urlKey: finalUrlKey }] : [])
                ]
            });

            if (existing) {
                return NextResponse.json({ error: 'Category with this name or URL key already exists' }, { status: 400 });
            }
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { name, urlKey: finalUrlKey, status },
            { new: true }
        );

        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
