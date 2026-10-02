import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEstimateItem {
  service: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IEstimate extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  estimateNumber: string;
  items: IEstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';
  notes?: string;
  expiryDate: Date;
  sentAt?: Date;
  emailSentAt?: Date;
  reminderSentAt?: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EstimateItemSchema = new Schema<IEstimateItem>(
  {
    service: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const EstimateSchema = new Schema<IEstimate>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    estimateNumber: { type: String, required: true, unique: true },
    items: [EstimateItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'accepted', 'declined'],
      default: 'draft',
    },
    notes: { type: String, default: 'Thank you for choosing H&H House Maintenance (hnhpros.ca). Estimate valid for 30 days.' },
    expiryDate: { type: Date, required: true },
    sentAt: { type: Date },
    emailSentAt: { type: Date },
    reminderSentAt: { type: Date },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

export const Estimate: Model<IEstimate> =
  mongoose.models.Estimate || mongoose.model<IEstimate>('Estimate', EstimateSchema);

export default Estimate;
