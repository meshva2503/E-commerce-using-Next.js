import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: string;
  orderId: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String },
  amount: { type: Number },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Delete the cached model to ensure schema updates are applied
if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}

export default mongoose.model<IPayment>('Payment', PaymentSchema);
