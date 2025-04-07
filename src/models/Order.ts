import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  totalAmount: number;
  tax: number;
  finalTotal: number;
  paymentStatus: string;
  paymentId: string;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  tax: { type: Number, required: true },
  finalTotal: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
