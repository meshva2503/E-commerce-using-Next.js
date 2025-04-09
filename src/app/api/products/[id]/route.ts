import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;

  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   await connectDB();
//   const body = await req.json();

//   try {
//     const updated = await ProductModel.findByIdAndUpdate(params.id, body, { new: true });
//     if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

//     return NextResponse.json({ message: 'Product updated', product: updated });
//   } catch (err) {
//     return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
//   }
// }

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  const formData = await req.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const images: File[] = formData.getAll('images') as File[];

  try {
    const existing = await ProductModel.findById(params.id);
    console.log("existing",existing);
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    let uploadedUrls: string[] = [];

    for (const file of images) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${uuid()}-${file.name}`;
      const filepath = path.join(process.cwd(), 'public/uploads', filename);
      await writeFile(filepath, buffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    existing.name = name;
    existing.description = description;
    existing.price = price;
    if (uploadedUrls.length > 0) {
      existing.image.push(...uploadedUrls);
    }

    await existing.save();

    return NextResponse.json({ message: 'Product updated', product: existing });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const deleted = await ProductModel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
