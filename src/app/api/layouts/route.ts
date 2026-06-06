import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Layout from '@/models/Layout';
import Category from '@/models/Category';

/**
 * GET: Fetch all layouts.
 * Supports: ?category=... &page=1 &limit=20 &sortBy=order|createdAt
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const sp = request.nextUrl.searchParams;
    const category = sp.get('category');
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') ?? '20', 10)));
    const sortBy = sp.get('sortBy') === 'order' ? { order: 1 as const } : { createdAt: -1 as const };

    // Build filter
    const filter: { category?: string } = {};
    if (category && category !== 'ALL') {
      const catExists = await Category.findOne({ name: category }).lean();
      if (!catExists) {
        return NextResponse.json(
          { success: false, error: `Invalid category.` },
          { status: 400 }
        );
      }
      filter.category = category;
    }

    const [layouts, total] = await Promise.all([
      Layout.find(filter)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Layout.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: layouts,
      count: layouts.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST: Create a new makeup layout. Order is auto-assigned as maxOrder + 1.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json() as {
      title?: string;
      description?: string;
      category?: string;
      imageUrl?: string;
      featured?: boolean;
      fileSize?: number;
    };

    const { title, description, category, imageUrl, featured, fileSize } = body;

    if (!title?.trim() || !imageUrl?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên ảnh và URL ảnh là bắt buộc.' },
        { status: 400 }
      );
    }

    // Validate category against DB
    let resolvedCategory = category ?? 'MAKEUP CONCEPT';
    if (category) {
      const catExists = await Category.findOne({ name: category }).lean();
      if (!catExists) {
        return NextResponse.json(
          { success: false, error: `Danh mục "${category}" không tồn tại.` },
          { status: 400 }
        );
      }
      resolvedCategory = category;
    }

    // Auto-assign order = maxOrder + 1
    const lastLayout = await Layout.findOne({}).sort({ order: -1 }).select('order').lean();
    const lastOrder = lastLayout ? (lastLayout as { order?: number }).order ?? 0 : 0;
    const nextOrder = lastOrder + 1;

    const newLayout = await Layout.create({
      title: title.trim(),
      description: description?.trim(),
      category: resolvedCategory,
      imageUrl: imageUrl.trim(),
      featured: featured ?? false,
      fileSize: fileSize ?? 0,
      order: nextOrder,
    });

    return NextResponse.json({ success: true, data: newLayout }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name: string }).name === 'ValidationError' &&
      'errors' in error
    ) {
      const msgs = Object.values(
        (error as { errors: Record<string, { message: string }> }).errors
      ).map((v) => v.message);
      return NextResponse.json({ success: false, error: msgs.join(', ') }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
