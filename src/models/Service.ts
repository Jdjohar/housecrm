import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  name: string;
  category: 'Gutter Care' | 'Pressure Washing' | 'Roof & Moss' | 'Window Care' | 'House Wash' | 'Deck & Fence' | 'Other';
  description: string;
  defaultPrice: number;
  unit: string; // e.g. "per job", "per sq ft", "per linear ft", "per window"
  seasonTag: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All Seasons';
  estimatedDurationHours: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Gutter Care', 'Pressure Washing', 'Roof & Moss', 'Window Care', 'House Wash', 'Deck & Fence', 'Other'],
      default: 'Other',
    },
    description: { type: String, default: '' },
    defaultPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'per job' },
    seasonTag: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'],
      default: 'All Seasons',
    },
    estimatedDurationHours: { type: Number, default: 2.0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
