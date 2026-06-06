import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactInfo from '@/models/ContactInfo';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { icon, label, value, sub, link, order } = body as {
      icon?: string;
      label?: string;
      value?: string;
      sub?: string;
      link?: string;
      order?: number;
    };

    const update: Record<string, unknown> = {};
    if (icon !== undefined) update.icon = icon.trim();
    if (label !== undefined) update.label = label.trim();
    if (value !== undefined) update.value = value.trim();
    if (sub !== undefined) update.sub = sub.trim();
    if (link !== undefined) update.link = link.trim();
    if (order !== undefined) update.order = order;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'Không có dữ liệu cần cập nhật.' }, { status: 400 });
    }

    const updated = await ContactInfo.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy thông tin liên hệ.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
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

    const deleted = await ContactInfo.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy thông tin liên hệ.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa thông tin liên hệ thành công.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
