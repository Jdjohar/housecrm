import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import { dispatchAutomatedMessage } from '@/lib/automationDispatcher';

export async function GET() {
  try {
    await connectToDatabase();
    const invoices = await Invoice.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const customer = await Customer.findById(body.customerId);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const count = await Invoice.countDocuments();
    const invoiceNumber = body.invoiceNumber || `INV-2026-${String(count + 301)}`;

    const total = Number(body.total) || 0;
    const initialPaymentAmount = Number(body.initialPaymentAmount) || 0;
    const amountPaid = initialPaymentAmount;
    const balanceDue = Math.max(0, Number((total - amountPaid).toFixed(2)));

    let payments = [];
    if (initialPaymentAmount > 0) {
      payments.push({
        amount: initialPaymentAmount,
        paymentDate: body.initialPaymentDate ? new Date(body.initialPaymentDate) : new Date(),
        paymentMethod: body.initialPaymentMethod || 'e-Transfer',
        collectedBy: body.initialPaymentCollectedBy || 'Charanjeet Brar',
        reference: body.initialPaymentReference || '',
        notes: body.initialPaymentNotes || 'Upfront payment / deposit received',
      });
    }

    let status = body.status || 'draft';
    if (balanceDue === 0 && total > 0) {
      status = 'paid';
    } else if (amountPaid > 0 && balanceDue > 0) {
      status = 'partially_paid';
    }

    const newInvoice = await Invoice.create({
      ...body,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      invoiceNumber,
      total,
      amountPaid,
      balanceDue,
      payments,
      status,
      paidAt: status === 'paid' ? new Date() : undefined,
    });

    if (body.status === 'sent' || body.sendSmsNow) {
      await dispatchAutomatedMessage({
        trigger: 'invoice_sent',
        customerId: customer._id.toString(),
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        referenceId: newInvoice._id.toString(),
        referenceNumber: newInvoice.invoiceNumber,
        amount: newInvoice.total,
      });

      newInvoice.sentAt = new Date();
      await newInvoice.save();
    }

    return NextResponse.json({ success: true, data: newInvoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
