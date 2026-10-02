import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import { dispatchAutomatedMessage } from '@/lib/automationDispatcher';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const job = await Job.findById(id).lean();
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: job });
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

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Action 1: Send Day Before Reminder SMS
    if (body.action === 'send_day_before_reminder') {
      job.status = 'reminder_sent';
      job.reminderSentAt = new Date();
      await job.save();

      const result = await dispatchAutomatedMessage({
        trigger: 'day_before_job',
        customerId: job.customerId.toString(),
        customerName: job.customerName,
        customerPhone: job.customerPhone,
        customerEmail: job.customerEmail,
        referenceId: job._id.toString(),
        referenceNumber: job.jobNumber,
        serviceName: job.services.join(', '),
        scheduledTime: job.scheduledTime || '10:00 AM',
      });

      return NextResponse.json({ success: true, data: job, notification: result });
    }

    // Action 2: Crew On The Way (Live ETA dispatch)
    if (body.action === 'send_crew_en_route') {
      const eta = body.etaMinutes || 25;
      job.status = 'en_route';
      job.etaMinutes = eta;
      job.enRouteSentAt = new Date();
      await job.save();

      const result = await dispatchAutomatedMessage({
        trigger: 'crew_leaving',
        customerId: job.customerId.toString(),
        customerName: job.customerName,
        customerPhone: job.customerPhone,
        customerEmail: job.customerEmail,
        referenceId: job._id.toString(),
        referenceNumber: job.jobNumber,
        serviceName: job.services.join(', '),
        etaMinutes: eta,
        crewName: job.assignedCrew,
      });

      return NextResponse.json({ success: true, data: job, notification: result });
    }

    // Action 3: Mark In Progress
    if (body.action === 'start_job') {
      job.status = 'in_progress';
      await job.save();
      return NextResponse.json({ success: true, data: job });
    }

    // Action 4: Job Completed -> triggers "Your H&H service has been completed"
    if (body.action === 'mark_completed') {
      job.status = 'completed';
      job.completedAt = new Date();
      if (body.completionNotes) {
        job.completionNotes = body.completionNotes;
      }
      await job.save();

      // Update customer last service date
      await Customer.findByIdAndUpdate(job.customerId, {
        lastServiceDate: new Date(),
        lastServiceType: job.services.join(', '),
      });

      // Dispatch Sequence #5: Job Completed
      const result = await dispatchAutomatedMessage({
        trigger: 'job_completed',
        customerId: job.customerId.toString(),
        customerName: job.customerName,
        customerPhone: job.customerPhone,
        customerEmail: job.customerEmail,
        referenceId: job._id.toString(),
        referenceNumber: job.jobNumber,
        serviceName: job.services.join(', '),
      });

      // Optionally auto-generate invoice if requested
      let createdInvoice: any = null;
      if (body.createInvoiceNow) {
        const invCount = await Invoice.countDocuments();
        const invoiceNumber = `INV-2026-${String(invCount + 301)}`;
        const subtotal = Number(job.subtotal) || Number(job.totalAmount) || 0;
        const tax = job.includeGst === false ? 0 : (Number(job.tax) || 0);
        const includeGst = job.includeGst !== false && tax > 0;
        const total = Number(job.totalAmount) || Number((subtotal + tax).toFixed(2));
        const amountPaid = Number(job.depositPaid) || 0;
        const balanceDue = job.balanceDue !== undefined ? Number(job.balanceDue) : Math.max(0, Number((total - amountPaid).toFixed(2)));

        let initialPayments = [];
        if (amountPaid > 0) {
          initialPayments.push({
            amount: amountPaid,
            paymentDate: job.createdAt || new Date(),
            paymentMethod: job.depositPaymentMethod || 'e-Transfer',
            collectedBy: job.depositCollectedBy || 'Charanjeet Brar',
            reference: `DEP-${job.jobNumber}`,
            notes: `Deposit of $${amountPaid.toFixed(2)} received during booking`,
            createdAt: new Date(),
          });
        }

        let invStatus: 'sent' | 'draft' | 'partially_paid' | 'paid' | 'overdue' = 'sent';
        if (balanceDue <= 0.01 && total > 0) {
          invStatus = 'paid';
        } else if (amountPaid > 0) {
          invStatus = 'partially_paid';
        }

        createdInvoice = await Invoice.create({
          customerId: job.customerId,
          customerName: job.customerName,
          customerEmail: job.customerEmail,
          customerPhone: job.customerPhone,
          jobId: job._id,
          invoiceNumber,
          items:
            job.items && job.items.length > 0
              ? job.items
              : job.services.map((srv: string) => ({
                  service: srv,
                  description: `H&H Professional Service for ${job.title}`,
                  quantity: 1,
                  unitPrice: Math.round(subtotal / (job.services.length || 1)),
                  total: Math.round(subtotal / (job.services.length || 1)),
                })),
          subtotal,
          tax,
          includeGst,
          total,
          amountPaid,
          balanceDue,
          payments: initialPayments,
          status: invStatus,
          dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          sentAt: new Date(),
          paidAt: invStatus === 'paid' ? new Date() : undefined,
        });

        // Trigger Sequence #6: Invoice Sent Notice
        await dispatchAutomatedMessage({
          trigger: 'invoice_sent',
          customerId: job.customerId.toString(),
          customerName: job.customerName,
          customerPhone: job.customerPhone,
          customerEmail: job.customerEmail,
          referenceId: createdInvoice._id.toString(),
          referenceNumber: invoiceNumber,
          amount: balanceDue > 0 ? balanceDue : total,
        });
      }

      return NextResponse.json({
        success: true,
        data: job,
        notification: result,
        invoice: createdInvoice,
      });
    }

    // Generic update
    const updated = await Job.findByIdAndUpdate(id, body, { new: true });
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
    await Job.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
