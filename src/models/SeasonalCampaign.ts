import mongoose, { Schema, Document, Model } from 'mongoose';

export type SeasonName = 'Spring' | 'Summer' | 'Fall' | 'Winter';

export interface ISeasonalCampaign extends Document {
  season: SeasonName;
  title: string;
  description: string;
  recommendedServices: string[];
  suggestedMonths: string;
  discountOffer?: string;
  defaultSmsTemplate: string;
  defaultEmailTemplate: string;
  targetCount: number;
  sentCount: number;
  responseCount: number;
  status: 'active' | 'scheduled' | 'draft' | 'completed';
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SeasonalCampaignSchema = new Schema<ISeasonalCampaign>(
  {
    season: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    recommendedServices: { type: [String], default: [] },
    suggestedMonths: { type: String, default: '' },
    discountOffer: { type: String, default: '10% Early Bird Discount' },
    defaultSmsTemplate: { type: String, required: true },
    defaultEmailTemplate: { type: String, required: true },
    targetCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    responseCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'scheduled', 'draft', 'completed'],
      default: 'active',
    },
    lastRunAt: { type: Date },
  },
  { timestamps: true }
);

export const SeasonalCampaign: Model<ISeasonalCampaign> =
  mongoose.models.SeasonalCampaign ||
  mongoose.model<ISeasonalCampaign>('SeasonalCampaign', SeasonalCampaignSchema);

export default SeasonalCampaign;
