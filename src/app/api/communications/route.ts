import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CommunicationLog from '@/models/CommunicationLog';
import { dispatchAutomatedMessage, generateCommunicationContent } from '@/lib/automationDispatcher';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const trigger = searchParams.get('trigger');
    const customerId = searchParams.get('customerId');

    let filter: any = {};
    if (trigger) filter.triggerEvent = trigger;
    if (customerId) filter.customerId = customerId;

    const logs = await CommunicationLog.find(filter).sort({ sentAt: -1 }).limit(100).lean();
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If preview-only request
    if (body.action === 'preview') {
      const preview = generateCommunicationContent(body);
      return NextResponse.json({ success: true, data: preview });
    }

    // Actual or simulated dispatch
    const result = await dispatchAutomatedMessage(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
