import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhotoBlock from '@/models/PhotoBlock';
import Layout from '@/models/Layout';
import mongoose from 'mongoose';

const LAYOUT_PHOTO_COUNT: Record<string, number> = {
  '1col': 1,
  '2col': 2,
  '3col': 3,
};

/**
 * GET /api/photo-blocks
 * Returns all photo blocks sorted by order, with photos populated.
 */
export async function GET() {
  try {
    await connectDB();

    const blocks = await PhotoBlock.find({})
      .sort({ order: 1 })
      .populate('photos')
      .lean();

    return NextResponse.json({ success: true, data: blocks });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/photo-blocks
 * Create a new photo block.
 * Body: { photoIds: string[], layoutType: '1col'|'2col'|'3col' }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json() as {
      photoIds?: string[];
      layoutType?: string;
    };

    const { photoIds, layoutType } = body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn ít nhất 1 ảnh.' },
        { status: 400 }
      );
    }

    if (!layoutType || !['1col', '2col', '3col'].includes(layoutType)) {
      return NextResponse.json(
        { success: false, error: 'Bố cục không hợp lệ.' },
        { status: 400 }
      );
    }

    // Validate: number of photos must match layout type
    const required = LAYOUT_PHOTO_COUNT[layoutType];
    if (photoIds.length !== required) {
      return NextResponse.json(
        {
          success: false,
          error: `Bố cục "${layoutType}" yêu cầu đúng ${required} ảnh. Bạn đang chọn ${photoIds.length} ảnh.`,
        },
        { status: 400 }
      );
    }

    // Validate: all photo IDs exist
    const objectIds = photoIds.map((id) => new mongoose.Types.ObjectId(id));
    const foundPhotos = await Layout.find({ _id: { $in: objectIds } }).select('_id order title').lean();
    if (foundPhotos.length !== photoIds.length) {
      return NextResponse.json(
        { success: false, error: 'Một số ảnh không tồn tại trong hệ thống.' },
        { status: 400 }
      );
    }

    // Validate: photos must not already belong to another block
    const existingBlock = await PhotoBlock.findOne({
      photos: { $in: objectIds },
    }).lean();
    if (existingBlock) {
      return NextResponse.json(
        { success: false, error: 'Một hoặc nhiều ảnh đã thuộc block khác. Mỗi ảnh chỉ được nằm trong 1 block.' },
        { status: 400 }
      );
    }

    // Assign order = max existing block order + 1
    const lastBlock = await PhotoBlock.findOne({}).sort({ order: -1 }).select('order').lean();
    const lastOrder = lastBlock ? (lastBlock as { order?: number }).order ?? 0 : 0;
    const nextOrder = lastOrder + 1;

    const newBlock = await PhotoBlock.create({
      photos: objectIds,
      layoutType,
      order: nextOrder,
    });

    // Populate the new block before returning
    const populated = await PhotoBlock.findById(newBlock._id).populate('photos').lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
