import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  jobId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  isFiveStar: boolean;
  actionTaken: 'google_redirect' | 'private_feedback' | 'pending';
  feedbackText?: string;
  customerExperienceTags?: string[];
  responseStatus: 'new' | 'reviewed' | 'contacted_client' | 'resolved' | 'archived';
  internalNotes?: string;
  requestedAt: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    customerEmail: { type: String },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    rating: { type: Number, min: 1, max: 5 },
    isFiveStar: { type: Boolean, default: false },
    actionTaken: {
      type: String,
      enum: ['google_redirect', 'private_feedback', 'pending'],
      default: 'pending',
    },
    feedbackText: { type: String, default: '' },
    customerExperienceTags: { type: [String], default: [] },
    responseStatus: {
      type: String,
      enum: ['new', 'reviewed', 'contacted_client', 'resolved', 'archived'],
      default: 'new',
    },
    internalNotes: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
