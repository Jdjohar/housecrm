import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  propertyType: 'Residential' | 'Commercial' | 'Strata' | 'Townhouse';
  notes?: string;
  tags: string[];
  lastServiceDate?: Date;
  lastServiceType?: string;
  seasonalOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Vancouver' },
    postalCode: { type: String, default: '' },
    propertyType: {
      type: String,
      enum: ['Residential', 'Commercial', 'Strata', 'Townhouse'],
      default: 'Residential',
    },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
    lastServiceDate: { type: Date },
    lastServiceType: { type: String },
    seasonalOptIn: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
