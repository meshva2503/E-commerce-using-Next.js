import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(req: Request) {
  try {
    const { name, description, price, image } = await req.json();
    
    await connectDB();

    const newProduct = new Product({ name, description, price, image });
    await newProduct.save();

    return NextResponse.json({ message: 'Product added successfully', product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
    try {
      await connectDB();
  
      const products = await Product.find({});
      return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
  }