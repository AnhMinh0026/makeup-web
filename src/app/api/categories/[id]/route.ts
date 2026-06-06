import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Layout from '@/models/Layout';

/**
 * PATCH /api/categories/[id] — đổi tên danh mục
 * Body: { name?: string, order?: number }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json() as { name?: string; order?: number };

    const update: { name?: string; order?: number } = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.order !== undefined) update.order = body.order;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có dữ liệu cần cập nhật.' },
        { status: 400 }
      );
    }

    // Nếu đổi tên: cập nhật tất cả layout đang dùng tên cũ
    if (update.name) {
      const existing = await Category.findById(id).lean();
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Không tìm thấy danh mục.' },
          { status: 404 }
        );
      }
      // Cập nhật field category trong layouts
      await Layout.updateMany({ category: existing.name }, { category: update.name });
    }

    const updated = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy danh mục.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: 'Tên danh mục đã tồn tại.' },
        { status: 409 }
      );
    }
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[id] — xóa danh mục
 * Từ chối nếu có ảnh đang dùng danh mục này
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy danh mục.' },
        { status: 404 }
      );
    }

    // Kiểm tra xem có ảnh nào đang thuộc danh mục này không
    const usedCount = await Layout.countDocuments({ category: category.name });
    if (usedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa! Có ${usedCount} ảnh đang thuộc danh mục này. Hãy chuyển hoặc xóa các ảnh trước.`,
        },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Đã xóa danh mục.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
