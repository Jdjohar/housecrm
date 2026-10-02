import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Estimate from '@/models/Estimate';
import Job from '@/models/Job';
import Invoice from '@/models/Invoice';
import CommunicationLog from '@/models/CommunicationLog';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const [estimates, jobs, invoices, communications, reviews] = await Promise.all([
      Estimate.find({ customerId: id }).sort({ createdAt: -1 }).lean(),
      Job.find({ customerId: id }).sort({ createdAt: -1 }).lean(),
      Invoice.find({ customerId: id }).sort({ createdAt: -1 }).lean(),
      CommunicationLog.find({ customerId: id }).sort({ sentAt: -1 }).lean(),
      Review.find({ customerId: id }).sort({ requestedAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customer,
        estimates,
        jobs,
        invoices,
        communications,
        reviews,
      },
    });
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

    const updated = await Customer.findByIdAndUpdate(id, body, { new: true }).lean();
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
    await Customer.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Customer deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
