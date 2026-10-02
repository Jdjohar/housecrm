import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Service from '@/models/Service';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const season = searchParams.get('season');
    const activeOnly = searchParams.get('active') === 'true';

    let filter: any = {};
    if (category) filter.category = category;
    if (season && season !== 'All Seasons') filter.seasonTag = { $in: [season, 'All Seasons'] };
    if (activeOnly) filter.active = true;

    let services = await Service.find(filter).sort({ category: 1, name: 1 }).lean();

    // If services table is empty, initialize with standard H&H House Maintenance services catalog
    if (services.length === 0 && !category) {
      await Service.create([
        {
          name: 'Gutter Cleaning & Downspout Flush',
          category: 'Gutter Care',
          description: 'Hand removal of leaves & debris + high volume downspout flow test',
          defaultPrice: 220,
          unit: 'per job',
          seasonTag: 'Fall',
          estimatedDurationHours: 2.0,
          active: true,
        },
        {
          name: 'Vinyl Siding Soft Wash (House Wash)',
          category: 'House Wash',
          description: 'Eco-friendly biodegradable detergent and low-pressure spotless rinse',
          defaultPrice: 280,
          unit: 'per house',
          seasonTag: 'Spring',
          estimatedDurationHours: 3.0,
          active: true,
        },
        {
          name: 'Driveway & Walkway Power Washing',
          category: 'Pressure Washing',
          description: 'Rotary surface cleaner pressure scrub for concrete, pavers & aggregate',
          defaultPrice: 180,
          unit: 'per driveway',
          seasonTag: 'Spring',
          estimatedDurationHours: 2.0,
          active: true,
        },
        {
          name: 'Roof De-Mossing & Moss Treatment',
          category: 'Roof & Moss',
          description: 'Gentle moss removal and eco-friendly moss inhibitor spray',
          defaultPrice: 450,
          unit: 'per roof',
          seasonTag: 'Fall',
          estimatedDurationHours: 3.5,
          active: true,
        },
        {
          name: 'Exterior Window Cleaning (Pure Water)',
          category: 'Window Care',
          description: 'Purified water-fed pole cleaning of exterior glass panes, frames & sills',
          defaultPrice: 160,
          unit: 'per 20 windows',
          seasonTag: 'Spring',
          estimatedDurationHours: 2.0,
          active: true,
        },
        {
          name: 'Patio & Deck Pressure Wash',
          category: 'Deck & Fence',
          description: 'Surface cleaning and mildew removal from cedar/composite decking & patios',
          defaultPrice: 200,
          unit: 'per patio',
          seasonTag: 'Summer',
          estimatedDurationHours: 2.5,
          active: true,
        },
        {
          name: 'Perimeter Fence Washing',
          category: 'Deck & Fence',
          description: 'Wood and vinyl fence cleaning & algae restoration',
          defaultPrice: 220,
          unit: 'per 100 ft',
          seasonTag: 'Summer',
          estimatedDurationHours: 2.5,
          active: true,
        },
      ]);

      services = await Service.find(filter).sort({ category: 1, name: 1 }).lean();
    }

    return NextResponse.json({ success: true, count: services.length, data: services });
  } catch (error: any) {
    console.error('Service GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || body.defaultPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Service name and price are required' },
        { status: 400 }
      );
    }

    const newService = await Service.create(body);
    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error: any) {
    console.error('Service POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
