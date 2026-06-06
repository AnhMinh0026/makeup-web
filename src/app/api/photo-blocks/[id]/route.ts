import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhotoBlock from '@/models/PhotoBlock';

/**
 * DELETE /api/photo-blocks/[id]
 * Delete a photo block by ID.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await PhotoBlock.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Block không tồn tại.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/photo-blocks/[id]
 * Update block order (for reordering).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json() as { order?: number };

    if (body.order === undefined) {
      return NextResponse.json(
        { success: false, error: 'Thiếu trường order.' },
        { status: 400 }
      );
    }

    const updated = await PhotoBlock.findByIdAndUpdate(
      id,
      { order: body.order },
      { new: true }
    ).populate('photos').lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Block không tồn tại.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
