import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

/**
 * GET /api/settings — lấy cài đặt toàn cục
 */
export async function GET() {
  try {
    await connectDB();

    // findOneAndUpdate với upsert: true đảm bảo luôn có 1 document
    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global', displayMode: '3col' } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/settings — cập nhật cài đặt
 * Body: { displayMode: '3col' | '2col' | '1col' }
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json() as { displayMode?: string };
    const { displayMode } = body;

    const validModes = ['3col', '2col', '1col'];
    if (displayMode && !validModes.includes(displayMode)) {
      return NextResponse.json(
        { success: false, error: 'displayMode không hợp lệ.' },
        { status: 400 }
      );
    }

    const updated = await Settings.findOneAndUpdate(
      { key: 'global' },
      { ...(displayMode && { displayMode }) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
