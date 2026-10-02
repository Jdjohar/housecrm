import mongoose, { Schema, Document, Model } from 'mongoose';

export type CommunicationTrigger =
  | 'estimate_sent'
  | 'estimate_followup'
  | 'day_before_job'
  | 'crew_leaving'
  | 'job_completed'
  | 'invoice_sent'
  | 'payment_received'
  | 'review_request'
  | 'seasonal_reminder';

export interface ICommunicationLog extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  channel: 'sms' | 'email' | 'both';
  triggerEvent: CommunicationTrigger;
  triggerTitle: string;
  subject?: string;
  messageContent: string;
  status: 'delivered' | 'sent' | 'simulated' | 'queued' | 'failed';
  referenceId?: string; // EstimateId, JobId, InvoiceId
  referenceType?: string;
  sentAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationLogSchema = new Schema<ICommunicationLog>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    recipientPhone: { type: String },
    recipientEmail: { type: String },
    channel: { type: String, enum: ['sms', 'email', 'both'], default: 'sms' },
    triggerEvent: {
      type: String,
      enum: [
        'estimate_sent',
        'estimate_followup',
        'day_before_job',
        'crew_leaving',
        'job_completed',
        'invoice_sent',
        'payment_received',
        'review_request',
        'seasonal_reminder',
      ],
      required: true,
    },
    triggerTitle: { type: String, required: true },
    subject: { type: String },
    messageContent: { type: String, required: true },
    status: {
      type: String,
      enum: ['delivered', 'sent', 'simulated', 'queued', 'failed'],
      default: 'delivered',
    },
    referenceId: { type: String },
    referenceType: { type: String },
    sentAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const CommunicationLog: Model<ICommunicationLog> =
  mongoose.models.CommunicationLog ||
  mongoose.model<ICommunicationLog>('CommunicationLog', CommunicationLogSchema);

export default CommunicationLog;
