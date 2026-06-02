import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Layout from '@/models/Layout';
import { LAYOUT_CATEGORIES, LayoutCategory } from '@/models/Layout';

/**
 * GET: Fetch all layouts, sorted newest first, with optional category filter.
 * Supports: ?category=... &page=1 &limit=20
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const sp = request.nextUrl.searchParams;
    const category = sp.get('category');
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') ?? '20', 10)));

    // Build filter
    const filter: { category?: LayoutCategory } = {};
    if (category && category !== 'ALL') {
      if (!LAYOUT_CATEGORIES.includes(category as LayoutCategory)) {
        return NextResponse.json(
          { success: false, error: `Invalid category.` },
          { status: 400 }
        );
      }
      filter.category = category as LayoutCategory;
    }

    const [layouts, total] = await Promise.all([
      Layout.find(filter)
        .sort({ createdAt: -1 })
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
 * POST: Create a new makeup layout.
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
        { success: false, error: 'Tên layout và URL ảnh là bắt buộc.' },
        { status: 400 }
      );
    }

    const newLayout = await Layout.create({
      title: title.trim(),
      description: description?.trim(),
      category: category ?? 'MAKEUP CONCEPT',
      imageUrl: imageUrl.trim(),
      featured: featured ?? false,
      fileSize: fileSize ?? 0,
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
