import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    urlKey: string;
    status: 'active' | 'inactive';
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    urlKey: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
