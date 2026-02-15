import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { generateProductEmbedding } from '@/lib/embeddingService';
import { upsertProductVector, deleteProductVector } from '@/lib/pineconeService';

import Category from '@/models/Category';

// Simple slugify helper
function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  try {
    const product = await ProductModel.findById(id).populate('category');
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();

  const { id } = await params;
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const categoryName = formData.get('category') as string | null; // Get category name
  const images: File[] = formData.getAll('images') as File[];

  console.log('PUT Request - Received Data:', { name, description, price, categoryName });

  try {
    const existing = await ProductModel.findById(id);
    console.log("existing", existing);
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Resolve Category ID
    let categoryId = undefined;
    if (categoryName) {
      const urlKey = slugify(categoryName);
      let category = await Category.findOne({
        $or: [{ name: categoryName }, { urlKey: urlKey }]
      });

      if (!category) {
        // Create New Category
        category = await Category.create({
          name: categoryName,
          urlKey: urlKey,
          status: 'active'
        });
        console.log(`Created new category via Edit Product: ${categoryName}`);
      }
      categoryId = category._id;
    }


    const existingImagesRaw = formData.get('existingImages') as string | null;
    let existingImages: string[] = [];
    if (existingImagesRaw) {
      try {
        existingImages = JSON.parse(existingImagesRaw);
      } catch (e) {
        console.error('Failed to parse existingImages:', e);
      }
    }


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
    existing.category = categoryId || undefined; // Update category ID

    // Replace with remaining images + new uploads
    existing.image = [...existingImages, ...uploadedUrls];

    console.log('Document before save:', existing);
    const savedDoc = await existing.save();
    console.log('Document after save:', savedDoc);

    // Regenerate embedding and update in Pinecone
    try {
      const embedding = await generateProductEmbedding({
        name,
        description,
        category: categoryName || undefined
      });

      const safePrice = isNaN(price) ? 0 : price;

      await upsertProductVector(
        id,
        embedding,
        {
          name: name || 'Unknown Product',
          category: categoryId?.toString(), // Use Category ID for metadata
          price: safePrice
        }
      );

      console.log('✅ Product vector updated in Pinecone');
    } catch (embeddingError) {
      console.error('⚠️ Failed to update embedding:', embeddingError);
      console.warn('Product updated in MongoDB but not re-indexed in Pinecone');
    }

    return NextResponse.json({ message: 'Product updated', product: existing });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete vector from Pinecone
    await deleteProductVector(id);

    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
