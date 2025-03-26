import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem extends Document {
  userId: string;      
  cartId: string;    
  productId: string; 
  quantity: number; 
  addedAt: Date;
}


const CartSchema = new Schema<ICartItem>({
  userId: { type: String, required: true },
  cartId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  addedAt: { type: Date, default: Date.now },
});


export default mongoose.models.Cart || mongoose.model<ICartItem>('Cart', CartSchema);
