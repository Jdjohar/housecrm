import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET() {
  try {
    await connectToDatabase();
    let setting = await Setting.findOne().lean();
    if (!setting) {
      setting = await Setting.create({
        companyName: 'H&H House Maintenance',
        website: 'https://hnhpros.ca/',
        phone: '(604) 555-0199',
        email: 'info@hnhpros.ca',
        address: '12888 80th Ave, Surrey / Vancouver, BC',
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      });
    }
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(body);
    } else {
      setting = await Setting.findByIdAndUpdate(setting._id, body, { new: true });
    }
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
