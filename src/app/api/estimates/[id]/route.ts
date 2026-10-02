import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import Job from '@/models/Job';
import Customer from '@/models/Customer';
import { dispatchAutomatedMessage } from '@/lib/automationDispatcher';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const estimate = await Estimate.findById(id).lean();
    if (!estimate) {
      return NextResponse.json({ success: false, error: 'Estimate not found' }, { status: 404 });
    }

    const customer = await Customer.findById(estimate.customerId).lean();

    return NextResponse.json({ success: true, data: { ...estimate, customer } });
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

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      return NextResponse.json({ success: false, error: 'Estimate not found' }, { status: 404 });
    }

    // Action 1: Send Initial Notification (SMS)
    if (body.action === 'send_estimate') {
      estimate.status = 'sent';
      estimate.sentAt = new Date();
      await estimate.save();

      const result = await dispatchAutomatedMessage({
        trigger: 'estimate_sent',
        customerId: estimate.customerId.toString(),
        customerName: estimate.customerName,
        customerPhone: estimate.customerPhone,
        customerEmail: estimate.customerEmail,
        referenceId: estimate._id.toString(),
        referenceNumber: estimate.estimateNumber,
        serviceName: estimate.items?.map((i) => i.service).join(', ') || 'House Maintenance',
        amount: estimate.total,
      });

      return NextResponse.json({ success: true, data: estimate, notification: result });
    }

    // Action 1b: Send Estimate via Email
    if (body.action === 'send_email') {
      estimate.status = 'sent';
      estimate.emailSentAt = new Date();
      await estimate.save();

      const targetEmail = body.customEmail || estimate.customerEmail;
      const result = await dispatchAutomatedMessage({
        trigger: 'estimate_sent',
        customerId: estimate.customerId.toString(),
        customerName: estimate.customerName,
        customerPhone: estimate.customerPhone,
        customerEmail: targetEmail,
        referenceId: estimate._id.toString(),
        referenceNumber: estimate.estimateNumber,
        serviceName: estimate.items?.map((i) => i.service).join(', ') || 'House Maintenance',
        amount: estimate.total,
      });

      return NextResponse.json({ success: true, data: estimate, emailSentTo: targetEmail, notification: result });
    }

    // Action 2: Send Follow-up Reminder ("Just following up on your H&H estimate")
    if (body.action === 'send_reminder') {
      estimate.reminderSentAt = new Date();
      await estimate.save();

      const result = await dispatchAutomatedMessage({
        trigger: 'estimate_followup',
        customerId: estimate.customerId.toString(),
        customerName: estimate.customerName,
        customerPhone: estimate.customerPhone,
        customerEmail: estimate.customerEmail,
        referenceId: estimate._id.toString(),
        referenceNumber: estimate.estimateNumber,
        serviceName: estimate.items?.map((i) => i.service).join(', ') || 'House Maintenance',
        amount: estimate.total,
      });

      return NextResponse.json({ success: true, data: estimate, notification: result });
    }

    // Action 3: Convert to Scheduled Job
    if (body.action === 'convert_to_job') {
      estimate.status = 'accepted';
      estimate.acceptedAt = new Date();
      await estimate.save();

      const customer = await Customer.findById(estimate.customerId);
      const jobCount = await Job.countDocuments();
      const jobNumber = `JOB-${String(jobCount + 4001)}`;

      const newJob = await Job.create({
        customerId: estimate.customerId,
        customerName: estimate.customerName,
        customerPhone: estimate.customerPhone,
        customerEmail: estimate.customerEmail,
        estimateId: estimate._id,
        jobNumber,
        title: estimate.items?.map((i) => i.service).join(' & ') || 'House Maintenance Service',
        services: estimate.items?.map((i) => i.service) || ['Exterior Cleaning'],
        address: customer ? `${customer.address}, ${customer.city}` : 'Client Property',
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : new Date(Date.now() + 2 * 24 * 3600 * 1000),
        scheduledTime: body.scheduledTime || '10:00 AM',
        assignedCrew: body.assignedCrew || 'H&H Lead Crew',
        durationHours: 3.0,
        status: 'scheduled',
        totalAmount: estimate.total,
      });

      return NextResponse.json({ success: true, data: estimate, job: newJob });
    }

    // Default update
    const updated = await Estimate.findByIdAndUpdate(id, body, { new: true });
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
    await Estimate.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Estimate deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
