import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: string;
  orderId: string; // Link payment to an order
  cardNumber: string;
  cvv: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: String, required: true },
  orderId: { type: String, required: true }, // New field
  cardNumber: { type: String, required: true },
  cvv: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
