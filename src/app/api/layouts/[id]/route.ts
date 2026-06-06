import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Layout from '@/models/Layout';
import Category from '@/models/Category';
import mongoose from 'mongoose';

type RouteContext = { params: Promise<{ id: string }> };

function isValidId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /api/layouts/[id] — Fetch single layout
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return NextResponse.json({ success: false, error: 'ID không hợp lệ.' }, { status: 400 });
  }
  try {
    await connectDB();
    const layout = await Layout.findById(id).lean();
    if (!layout) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy layout.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: layout });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/layouts/[id] — Update a layout
 */
export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return NextResponse.json({ success: false, error: 'ID không hợp lệ.' }, { status: 400 });
  }
  try {
    await connectDB();

    const body = await req.json() as {
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

    if (category) {
      const catExists = await Category.findOne({ name: category }).lean();
      if (!catExists) {
        return NextResponse.json(
          { success: false, error: 'Danh mục không hợp lệ.' },
          { status: 400 }
        );
      }
    }

    const updated = await Layout.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description?.trim() ?? '',
        category: category ?? 'MAKEUP CONCEPT',
        imageUrl: imageUrl.trim(),
        featured: featured ?? false,
        fileSize: fileSize ?? 0,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy layout.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/layouts/[id] — Delete a layout
 */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isValidId(id)) {
    return NextResponse.json({ success: false, error: 'ID không hợp lệ.' }, { status: 400 });
  }
  try {
    await connectDB();
    const deleted = await Layout.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy layout.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Đã xóa thành công.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
