import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { sampleProducts } from '@/data/sample_products';
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

export async function POST() {
    try {
        await connectDB();

        const results = {
            added: 0,
            skipped: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const productData of sampleProducts) {
            try {
                let categoryId = null;

                if (productData.category) {
                    const urlKey = slugify(productData.category);

                    const category = await Category.findOneAndUpdate(
                        { urlKey: urlKey }, // search condition (unique field)
                        {
                            $setOnInsert: {
                                name: productData.category,
                                urlKey: urlKey,
                                status: 'active'
                            }
                        },
                        {
                            new: true,
                            upsert: true
                        }
                    );

                    categoryId = category._id;
                }

                let productId = null;

                // 2. Check if product exists
                let existing = await Product.findOne({ name: productData.name });
                if (existing) {
                    // Update existing product with category ID if needed (migration)
                    if (categoryId && (!existing.category || existing.category.toString() !== categoryId.toString())) {
                        existing.category = categoryId;
                        await existing.save();
                        console.log(`Updated category for existing product: ${productData.name}`);
                    } else {
                        console.log(`Product already exists: ${productData.name}`);
                    }
                    productId = existing._id;
                    results.skipped++; // Keep tracking as skipped for MongoDB creation, but we'll sync vector
                } else {
                    // 3. Create Product in MongoDB
                    const newProduct = new Product({
                        ...productData,
                        category: categoryId // Use ID instead of string
                    });
                    await newProduct.save();
                    productId = newProduct._id;
                    results.added++;
                }

                // 4. Generate Embedding & Upsert to Pinecone (Always run this to ensure sync)
                if (productId) {
                    try {
                        const embedding = await generateProductEmbedding({
                            name: productData.name,
                            description: productData.description,
                            category: productData.category // string from data
                        });

                        await upsertProductVector(
                            productId.toString(),
                            embedding,
                            {
                                name: productData.name,
                                category: categoryId?.toString(), // Use Category ID for metadata
                                price: productData.price
                            }
                        );
                        console.log(`Synced vector for: ${productData.name}`);
                    } catch (embError) {
                        console.error(`Failed embedding for ${productData.name}:`, embError);
                    }
                }
                continue;
            } catch (err) {
                console.error(`Failed to seed product ${productData.name}:`, err);
                results.failed++;
                results.errors.push(`${productData.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }

        return NextResponse.json({
            message: 'Seeding complete',
            results
        });

    } catch (error) {
        console.error('Seeding fatal error:', error);
        return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
    }
}
