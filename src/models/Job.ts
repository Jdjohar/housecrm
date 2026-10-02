import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJobItem {
  service: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IJob extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  estimateId?: mongoose.Types.ObjectId;
  jobNumber: string;
  title: string;
  services: string[];
  items?: IJobItem[];
  subtotal?: number;
  tax?: number;
  includeGst?: boolean;
  depositPaid?: number;
  depositCollectedBy?: string; // e.g. "Charanjeet Brar", "Manpreet Gill", "Company Account"
  depositPaymentMethod?: string; // e.g. "e-Transfer", "Cash", "Credit Card", "Cheque"
  balanceDue?: number;
  jobCosts?: number; // Internal labor/material expense tracking
  address: string;
  scheduledDate: Date;
  scheduledTime: string; // e.g. "10:00 AM"
  durationHours: number;
  assignedCrew: string; // e.g. "Crew Alpha - Mike & Dave"
  status: 'scheduled' | 'reminder_sent' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  etaMinutes?: number;
  notes?: string;
  customerNotes?: string;
  completionNotes?: string;
  totalAmount: number;
  bookingConfirmationSentAt?: Date;
  reminderSentAt?: Date;
  enRouteSentAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobItemSchema = new Schema<IJobItem>(
  {
    service: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const JobSchema = new Schema<IJob>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    estimateId: { type: Schema.Types.ObjectId, ref: 'Estimate' },
    jobNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    services: { type: [String], required: true },
    items: [JobItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    includeGst: { type: Boolean, default: true },
    depositPaid: { type: Number, default: 0 },
    depositCollectedBy: { type: String, default: '' },
    depositPaymentMethod: { type: String, default: 'e-Transfer' },
    balanceDue: { type: Number, default: 0 },
    jobCosts: { type: Number, default: 0 },
    address: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, default: '10:00 AM' },
    durationHours: { type: Number, default: 2.5 },
    assignedCrew: { type: String, default: 'H&H Lead Crew' },
    status: {
      type: String,
      enum: ['scheduled', 'reminder_sent', 'en_route', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    etaMinutes: { type: Number, default: 25 },
    notes: { type: String, default: '' },
    customerNotes: { type: String, default: '' },
    completionNotes: { type: String, default: '' },
    totalAmount: { type: Number, required: true },
    bookingConfirmationSentAt: { type: Date },
    reminderSentAt: { type: Date },
    enRouteSentAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Job) {
  delete (mongoose.models as any).Job;
}

export const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
