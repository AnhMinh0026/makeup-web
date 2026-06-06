import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { name, price, items, highlight, order } = body as {
      name?: string;
      price?: string;
      items?: string[];
      highlight?: boolean;
      order?: number;
    };

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name.trim();
    if (price !== undefined) update.price = price.trim();
    if (items !== undefined) update.items = Array.isArray(items) ? items : [];
    if (highlight !== undefined) update.highlight = !!highlight;
    if (order !== undefined) update.order = order;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'Không có dữ liệu cần cập nhật.' }, { status: 400 });
    }

    const updated = await Service.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dịch vụ.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ success: false, error: 'Tên dịch vụ đã tồn tại.' }, { status: 409 });
    }
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dịch vụ.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa dịch vụ thành công.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
