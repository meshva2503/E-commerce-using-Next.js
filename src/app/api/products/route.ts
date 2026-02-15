import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import fs from 'fs/promises';
import path from 'path';
import { generateProductEmbedding } from '@/lib/embeddingService';
import { upsertProductVector } from '@/lib/pineconeService';

// Simple slugify helper
function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const categoryName = formData.get('category'); // Get category field (name)
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

    // Resolve Category
    let categoryId = undefined;
    if (categoryName) {
      const urlKey = slugify(categoryName as string);
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
        console.log(`Created new category via Add Product: ${categoryName}`);
      }
      categoryId = category._id;
    }

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
      category: categoryId, // Use resolved ID
    });
    await newProduct.save();

    // Generate embedding and store in Pinecone
    try {
      const embedding = await generateProductEmbedding({
        name: name as string,
        description: description as string,
        category: categoryName as string | undefined
      });

      await upsertProductVector(
        newProduct._id.toString(),
        embedding,
        {
          name: name as string,
          category: categoryId?.toString(), // Use Category ID for metadata
          price: parsedPrice
        }
      );

      console.log('✅ Product vector stored in Pinecone');
    } catch (embeddingError) {
      // Log error but don't fail the product creation
      console.error('⚠️ Failed to generate/store embedding:', embeddingError);
      console.warn('Product saved to MongoDB but not indexed in Pinecone');
    }

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

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 9;
    const category = url.searchParams.get('category'); // Get category param
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (category) {
      // Resolve category string to ID
      // Try finding by urlKey (preferred) or name
      const categoryDoc = await Category.findOne({
        $or: [{ urlKey: category }, { name: category }]
      });

      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // If category specified but not found, return empty
        return NextResponse.json({
          products: [],
          total: 0,
          currentPage: page,
          totalPages: 0
        }, { status: 200 });
      }
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name urlKey') // Populate category details
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        products,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}