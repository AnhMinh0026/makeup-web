import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Layout from '@/models/Layout';

/**
 * POST /api/layouts/migrate-orders
 * One-time migration: assign sequential order to all layouts that don't have one yet.
 * Assigns orders based on createdAt ascending (oldest = 1).
 */
export async function POST() {
  try {
    await connectDB();

    // Find layouts without order (or order = 0/null)
    const unordered = await Layout.find({
      $or: [{ order: { $exists: false } }, { order: null }, { order: 0 }],
    })
      .sort({ createdAt: 1 })
      .lean();

    if (unordered.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tất cả ảnh đã có số thứ tự.',
        migrated: 0,
      });
    }

    // Find the current max order
    const lastOrdered = await Layout.findOne({ order: { $exists: true, $gt: 0 } })
      .sort({ order: -1 })
      .select('order')
      .lean();
    let currentMax = lastOrdered ? (lastOrdered as { order?: number }).order ?? 0 : 0;

    // Assign sequential orders
    const updates = [];
    for (const layout of unordered) {
      currentMax += 1;
      updates.push(
        Layout.findByIdAndUpdate(layout._id, { order: currentMax })
      );
    }
    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `Đã gán số thứ tự cho ${unordered.length} ảnh.`,
      migrated: unordered.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
