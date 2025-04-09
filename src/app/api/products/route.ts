import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const imageFiles = formData.getAll('images');
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid positive number' },
        { status: 400 }
      );
    }

    await connectDB();

    const imageUrls = [];

    if (imageFiles && imageFiles.length > 0) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];


      for (const imageFile of imageFiles) {
        if (!validTypes.includes(imageFile.type)) {
          return NextResponse.json(
            { message: 'Only JPEG, PNG, and GIF images are allowed' },
            { status: 400 }
          );
        }

        const fileExt = path.extname(imageFile.name);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
        const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

        await fs.mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true });

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        imageUrls.push(`/uploads/${fileName}`);
      }
    }

    const newProduct = new Product({
      name,
      description,
      price: parsedPrice,
      image: imageUrls.length > 0 ? imageUrls : null,
    });
    await newProduct.save();

    return NextResponse.json(
      { message: 'Product added successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({});
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}