import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import Customer from '@/models/Customer';
import { dispatchAutomatedMessage } from '@/lib/automationDispatcher';

export async function GET() {
  try {
    await connectToDatabase();
    const estimates = await Estimate.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: estimates });
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

    const count = await Estimate.countDocuments();
    const estimateNumber = body.estimateNumber || `EST-2026-${String(count + 101).padStart(3, '0')}`;

    const newEstimate = await Estimate.create({
      ...body,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      estimateNumber,
    });

    // If marked as sent or sendNotification is true, trigger Sequence #1: "When estimate is sent"
    if (body.status === 'sent' || body.sendSmsNow) {
      await dispatchAutomatedMessage({
        trigger: 'estimate_sent',
        customerId: customer._id.toString(),
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        referenceId: newEstimate._id.toString(),
        referenceNumber: newEstimate.estimateNumber,
        serviceName: newEstimate.items?.map((i: any) => i.service).join(', ') || 'House Maintenance',
        amount: newEstimate.total,
      });

      newEstimate.sentAt = new Date();
      await newEstimate.save();
    }

    return NextResponse.json({ success: true, data: newEstimate }, { status: 201 });
  } catch (error: any) {
    console.error('Estimate POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
