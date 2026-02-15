import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// Simple slugify helper (same as in other files)
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
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed');
        }

        const productsCollection = db.collection('products');
        // Fetch all products - using raw collection to bypass Mongoose schema
        // because Schema expects ObjectId but DB has Strings
        const allProducts = await productsCollection.find({}).toArray();

        const results = {
            total: allProducts.length,
            migrated: 0,
            skipped: 0,
            errors: [] as string[]
        };

        for (const product of allProducts) {
            try {
                // Check if category is already an ObjectId (or null)
                if (!product.category) {
                    results.skipped++;
                    continue;
                }

                // Check if it's already an ObjectId
                if (typeof product.category === 'object' && product.category._bsontype === 'ObjectID') {
                    results.skipped++;
                    continue;
                }

                // If it's a string, we need to migrate it
                if (typeof product.category === 'string') {
                    const categoryName = product.category;
                    const urlKey = slugify(categoryName);

                    // Find or Create Category
                    let category = await Category.findOne({
                        $or: [{ name: categoryName }, { urlKey: urlKey }]
                    });

                    if (!category) {
                        category = await Category.create({
                            name: categoryName,
                            urlKey: urlKey,
                            status: 'active'
                        });
                        console.log(`Migration: Created new category '${categoryName}'`);
                    }

                    // Update Product with ObjectId
                    await productsCollection.updateOne(
                        { _id: product._id },
                        { $set: { category: category._id } }
                    );

                    console.log(`Migration: Updated product '${product.name}' category to ObjectId`);
                    results.migrated++;
                } else {
                    // Unknown type
                    results.skipped++;
                }

            } catch (err: any) {
                console.error(`Failed to migrate product ${product.name}:`, err);
                results.errors.push(`${product.name}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: 'Migration complete',
            results
        });

    } catch (error: any) {
        console.error('Migration fatal error:', error);
        return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
    }
}
