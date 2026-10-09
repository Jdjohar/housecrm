import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';
import Customer from '@/models/Customer';
import { dispatchAutomatedMessage } from '@/lib/automationDispatcher';
import { getNextJobNumber } from '@/lib/sequences';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let filter: any = {};
    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter).sort({ scheduledDate: -1 }).lean();
    return NextResponse.json({ success: true, count: jobs.length, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let customer = null;

    // Option 1: Existing Customer
    if (body.customerId) {
      customer = await Customer.findById(body.customerId);
    } 
    // Option 2: Quick Create New Customer on-the-fly
    else if (body.newCustomer) {
      if (!body.newCustomer.name || !body.newCustomer.phone) {
        return NextResponse.json(
          { success: false, error: 'Customer name and phone number are required' },
          { status: 400 }
        );
      }

      customer = await Customer.create({
        name: body.newCustomer.name,
        phone: body.newCustomer.phone,
        email: body.newCustomer.email || `${body.newCustomer.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        address: body.newCustomer.address || 'Lower Mainland',
        city: body.newCustomer.city || 'Vancouver',
        postalCode: body.newCustomer.postalCode || 'BC',
        propertyType: body.newCustomer.propertyType || 'Residential',
        notes: body.newCustomer.notes || 'Created during booking',
      });
    }

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer information is required' }, { status: 400 });
    }

    const jobNumber = await getNextJobNumber(body.jobNumber);

    const servicesList =
      body.services?.length > 0
        ? body.services
        : body.items?.map((i: any) => i.service) || ['Exterior Cleaning'];

    const title = body.title || servicesList.join(' & ') || 'House Maintenance Service';

    const subtotal = Number(body.subtotal) || 0;
    const includeGst = body.includeGst !== false;
    const tax = Number(body.tax) || 0;
    const totalAmount = Number(body.totalAmount) || (subtotal + tax);
    const depositPaid = Number(body.depositPaid) || 0;
    const depositCollectedBy = body.depositCollectedBy || '';
    const depositPaymentMethod = body.depositPaymentMethod || 'e-Transfer';
    const balanceDue = Number((totalAmount - depositPaid).toFixed(2));
    const jobCosts = Number(body.jobCosts) || 0;

    const newJob = await Job.create({
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      estimateId: body.estimateId,
      jobNumber,
      title,
      services: servicesList,
      items: body.items || [],
      subtotal,
      tax,
      includeGst,
      depositPaid,
      depositCollectedBy,
      depositPaymentMethod,
      balanceDue,
      jobCosts,
      totalAmount,
      address: body.address || `${customer.address}, ${customer.city}`,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : new Date(),
      scheduledTime: body.scheduledTime || '10:00 AM',
      durationHours: body.durationHours || 2.5,
      assignedCrew: body.assignedCrew || 'H&H Lead Crew',
      status: body.status || 'scheduled',
      notes: body.notes || '',
      customerNotes: body.customerNotes || '',
    });

    // If confirmation requested, dispatch communication
    if (body.sendConfirmationNow) {
      await dispatchAutomatedMessage({
        trigger: 'day_before_job',
        customerId: customer._id.toString(),
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        referenceId: newJob._id.toString(),
        referenceNumber: newJob.jobNumber,
        serviceName: title,
        scheduledTime: newJob.scheduledTime,
        amount: newJob.totalAmount,
      });

      newJob.bookingConfirmationSentAt = new Date();
      await newJob.save();
    }

    return NextResponse.json({ success: true, data: newJob, customer }, { status: 201 });
  } catch (error: any) {
    console.error('Job POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
