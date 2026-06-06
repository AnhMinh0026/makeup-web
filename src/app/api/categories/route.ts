import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

const DEFAULT_CATEGORIES = [
  { name: 'MAKEUP CÔ DÂU', order: 1 },
  { name: 'MAKEUP TIỆC', order: 2 },
  { name: 'MAKEUP KỶ YẾU', order: 3 },
  { name: 'MAKEUP SỰ KIỆN', order: 4 },
  { name: 'MAKEUP CONCEPT', order: 5 },
];

/**
 * GET /api/categories — lấy tất cả danh mục, sắp xếp theo order
 */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ order: 1, name: 1 }).lean();

    // Nếu chưa có danh mục nào → tự động seed
    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      const seeded = await Category.find({}).sort({ order: 1, name: 1 }).lean();
      return NextResponse.json({ success: true, data: seeded });
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/categories — tạo danh mục mới
 * Body: { name: string }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json() as { name?: string };
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Tên danh mục là bắt buộc.' },
        { status: 400 }
      );
    }

    // Tính order: lấy max hiện tại + 1
    const lastCat = await Category.findOne({}).sort({ order: -1 }).lean();
    const nextOrder = lastCat ? (lastCat.order ?? 0) + 1 : 1;

    const category = await Category.create({ name, order: nextOrder });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: 'Danh mục này đã tồn tại.' },
        { status: 409 }
      );
    }
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
