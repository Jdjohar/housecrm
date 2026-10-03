import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Job from '@/models/Job';
import { dispatchAutomatedMessage } from '@/lib/automationDispatcher';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    // Action 1: Send Invoice
    if (body.action === 'send_invoice') {
      invoice.status = 'sent';
      invoice.sentAt = new Date();
      await invoice.save();

      const notif = await dispatchAutomatedMessage({
        trigger: 'invoice_sent',
        customerId: invoice.customerId.toString(),
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        customerEmail: invoice.customerEmail,
        referenceId: invoice._id.toString(),
        referenceNumber: invoice.invoiceNumber,
        amount: invoice.total,
      });

      return NextResponse.json({ success: true, data: invoice, notification: notif });
    }

    // Action 2: Record / Add Payment (Partial or Full Payment)
    if (body.action === 'record_payment' || body.action === 'add_payment') {
      const payAmount = Number(body.amount) || Number(body.paymentAmount) || Math.max(0, (invoice.total || 0) - (invoice.amountPaid || 0));
      const payMethod = body.paymentMethod || 'Interac e-Transfer';
      const payCollector = body.collectedBy || body.paymentCollectedBy || 'Charanjeet Brar';
      const payRef = body.reference || body.paymentReference || `REC-${Date.now().toString().slice(-6)}`;
      const payNotes = body.notes || body.paymentNotes || 'Payment received and logged';
      const payDate = body.paymentDate ? new Date(body.paymentDate) : new Date();

      if (!invoice.payments) {
        invoice.payments = [];
      }

      invoice.payments.push({
        amount: payAmount,
        paymentDate: payDate,
        paymentMethod: payMethod,
        collectedBy: payCollector,
        reference: payRef,
        notes: payNotes,
        createdAt: new Date(),
      });

      const currentPaid = invoice.payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
      invoice.amountPaid = Number(currentPaid.toFixed(2));
      const totalAmount = Number(invoice.total) || 0;
      invoice.balanceDue = Math.max(0, Number((totalAmount - invoice.amountPaid).toFixed(2)));
      invoice.paymentMethod = payMethod;
      invoice.paymentReference = payRef;
      invoice.paymentCollectedBy = payCollector;

      const isFullyPaid = invoice.balanceDue <= 0.01;
      if (isFullyPaid) {
        invoice.status = 'paid';
        invoice.paidAt = new Date();
      } else {
        invoice.status = 'partially_paid';
      }

      await invoice.save();

      // Sync linked Job balanceDue
      if (invoice.jobId) {
        await Job.findByIdAndUpdate(invoice.jobId, { balanceDue: invoice.balanceDue });
      }

      let payNotif = null;
      let reviewNotif = null;

      // Trigger #7: Payment Received Notification
      if (body.sendReceiptNow !== false) {
        payNotif = await dispatchAutomatedMessage({
          trigger: 'payment_received',
          customerId: invoice.customerId.toString(),
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          customerEmail: invoice.customerEmail,
          referenceId: invoice._id.toString(),
          referenceNumber: invoice.invoiceNumber,
          amount: payAmount,
        });
      }

      // Trigger #8: Automatic Review Request Funnel (if fully paid)
      if (isFullyPaid && body.sendReviewRequestNow !== false) {
        reviewNotif = await dispatchAutomatedMessage({
          trigger: 'review_request',
          customerId: invoice.customerId.toString(),
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          customerEmail: invoice.customerEmail,
          referenceId: invoice.jobId ? invoice.jobId.toString() : invoice.customerId.toString(),
          referenceNumber: invoice.invoiceNumber,
        });
      }

      return NextResponse.json({
        success: true,
        data: invoice,
        paymentNotification: payNotif,
        reviewNotification: reviewNotif,
        isFullyPaid,
      });
    }

    // Generic update
    const updated = await Invoice.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Invoice.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Invoice deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
