import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Layout from '@/models/Layout';

/**
 * GET /api/layouts/next-order
 * Returns the next available order number and all used order numbers.
 */
export async function GET() {
  try {
    await connectDB();

    const layouts = await Layout.find({}, { order: 1 }).sort({ order: 1 }).lean();
    const usedOrders = layouts.map((l) => (l as { order: number }).order).filter(Boolean);
    const nextOrder = usedOrders.length > 0 ? Math.max(...usedOrders) + 1 : 1;

    return NextResponse.json({ success: true, nextOrder, usedOrders });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
