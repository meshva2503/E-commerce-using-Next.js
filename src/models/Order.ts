import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  totalAmount: number;
  tax: number;
  finalTotal: number;
  paymentStatus: string;
  paymentId: string;
  orderStatus: string;
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
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentId: { type: String },
  orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

// Delete the cached model to ensure schema updates are applied
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model<IOrder>('Order', OrderSchema);
