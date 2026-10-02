import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceItem {
  service: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoicePayment {
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  collectedBy: string;
  reference?: string;
  notes?: string;
  createdAt?: Date;
}

export interface IInvoice extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  jobId?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  includeGst?: boolean;
  total: number;
  amountPaid: number;
  balanceDue: number;
  payments: IInvoicePayment[];
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue';
  dueDate: Date;
  paidAt?: Date;
  sentAt?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  paymentCollectedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    service: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const InvoicePaymentSchema = new Schema<IInvoicePayment>(
  {
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'e-Transfer' },
    collectedBy: { type: String, default: 'Charanjeet Brar' },
    reference: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    invoiceNumber: { type: String, required: true, unique: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    includeGst: { type: Boolean, default: true },
    total: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    payments: [InvoicePaymentSchema],
    status: {
      type: String,
      enum: ['draft', 'sent', 'partially_paid', 'paid', 'overdue'],
      default: 'draft',
    },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    sentAt: { type: Date },
    paymentMethod: { type: String },
    paymentReference: { type: String },
    paymentCollectedBy: { type: String },
    notes: { type: String, default: 'Payment is due upon receipt. Thank you for choosing H&H House Maintenance!' },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Invoice) {
  delete (mongoose.models as any).Invoice;
}

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
