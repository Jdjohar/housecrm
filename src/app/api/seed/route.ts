import { NextResponse } from 'next/server';
import { clearAllData } from '@/lib/clearData';

export async function POST() {
  try {
    const result = await clearAllData();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Clear data API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await clearAllData();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Clear data API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear data' },
      { status: 500 }
    );
  }
}
