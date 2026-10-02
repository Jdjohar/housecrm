import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SeasonalCampaign from '@/models/SeasonalCampaign';
import Customer from '@/models/Customer';
import { dispatchAutomatedMessage } from '@/lib/automationDispatcher';

export async function GET() {
  try {
    await connectToDatabase();
    const campaigns = await SeasonalCampaign.find().sort({ createdAt: 1 }).lean();

    // Fetch counts of eligible customers for each season
    const allCustomers = await Customer.find({ seasonalOptIn: true }).lean();

    const springEligible = allCustomers.filter((c) =>
      c.tags.some((t) => /spring|gutter|wash|driveway|window/i.test(t))
    ).length;

    const summerEligible = allCustomers.filter((c) =>
      c.tags.some((t) => /summer|pressure|power|deck|fence|lawn/i.test(t))
    ).length;

    const fallEligible = allCustomers.filter((c) =>
      c.tags.some((t) => /fall|gutter|roof|moss/i.test(t))
    ).length;

    return NextResponse.json({
      success: true,
      data: campaigns,
      eligibleCounts: {
        Spring: springEligible || allCustomers.length,
        Summer: summerEligible || allCustomers.length,
        Fall: fallEligible || allCustomers.length,
        TotalOptIn: allCustomers.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Bulk launch seasonal campaign
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { season, customMessage, discountOffer } = body;

    const campaign = await SeasonalCampaign.findOne({ season });
    const customers = await Customer.find({ seasonalOptIn: true });

    let sentCount = 0;
    const dispatchedLogs = [];

    for (const customer of customers) {
      const dispatchRes = await dispatchAutomatedMessage({
        trigger: 'seasonal_reminder',
        customerId: customer._id.toString(),
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        seasonName: season,
      });

      if (dispatchRes.success) {
        sentCount++;
        dispatchedLogs.push({
          customer: customer.name,
          phone: customer.phone,
        });
      }
    }

    if (campaign) {
      campaign.sentCount += sentCount;
      campaign.lastRunAt = new Date();
      if (discountOffer) campaign.discountOffer = discountOffer;
      await campaign.save();
    }

    return NextResponse.json({
      success: true,
      season,
      totalDispatched: sentCount,
      message: `Successfully launched ${season} Seasonal Reminder to ${sentCount} previous customers!`,
      details: dispatchedLogs,
    });
  } catch (error: any) {
    console.error('Seasonal POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
