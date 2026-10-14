import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { findExistingCustomer } from '@/lib/customerDuplicates';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const season = searchParams.get('season');

    let filter: any = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ];
    }

    if (season) {
      filter.tags = { $in: [new RegExp(season, 'i')] };
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: customers.length, data: customers });
  } catch (error: any) {
    console.error('Customer GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    // Check for duplicate customer
    const existing = await findExistingCustomer({
      phone: body.phone,
      email: body.email,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Customer already exists: "${existing.name}" (${existing.phone}). Duplicate customer is not allowed.`,
          data: existing,
        },
        { status: 409 }
      );
    }

    const newCustomer = await Customer.create(body);
    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error: any) {
    console.error('Customer POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create customer' },
      { status: 400 }
    );
  }
}
