import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';

const DEFAULT_SERVICES = [
  {
    name: 'Makeup Cô Dâu',
    price: 'Từ 2.500.000đ',
    items: ['Tư vấn & thử makeup trước ngày cưới', 'Makeup cô dâu ngày cưới', 'Chăm sóc & fix makeup cả ngày', 'Bao gồm: làm tóc cô dâu cơ bản'],
    highlight: true,
    order: 1,
  },
  {
    name: 'Makeup Tiệc / Sự Kiện',
    price: 'Từ 800.000đ',
    items: ['Makeup dự tiệc sang trọng', 'Phù hợp các buổi lễ, sự kiện', 'Tư vấn phong cách phù hợp'],
    highlight: false,
    order: 2,
  },
  {
    name: 'Makeup Kỷ Yếu',
    price: 'Từ 650.000đ',
    items: ['Makeup trẻ trung, rạng rỡ', 'Phong cách tự nhiên hoặc glamour', 'Phù hợp chụp kỷ yếu ngoài trời & phòng'],
    highlight: false,
    order: 3,
  },
  {
    name: 'Makeup Concept / Editorial',
    price: 'Từ 1.200.000đ',
    items: ['Makeup nghệ thuật theo concept', 'Phù hợp chụp ảnh nghệ thuật, TVC', 'Trao đổi chi tiết trước buổi chụp'],
    highlight: false,
    order: 4,
  },
];

export async function GET() {
  try {
    await connectDB();
    let services = await Service.find({}).sort({ order: 1, createdAt: 1 }).lean();

    if (services.length === 0) {
      await Service.insertMany(DEFAULT_SERVICES);
      services = await Service.find({}).sort({ order: 1, createdAt: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, price, items, highlight, order } = body as {
      name?: string;
      price?: string;
      items?: string[];
      highlight?: boolean;
      order?: number;
    };

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Tên dịch vụ là bắt buộc.' }, { status: 400 });
    }
    if (!price || !price.trim()) {
      return NextResponse.json({ success: false, error: 'Giá dịch vụ là bắt buộc.' }, { status: 400 });
    }

    // Determine order if not provided
    let nextOrder = order;
    if (order === undefined) {
      const lastService = await Service.findOne({}).sort({ order: -1 }).lean();
      nextOrder = lastService ? (lastService.order ?? 0) + 1 : 1;
    }

    const service = await Service.create({
      name: name.trim(),
      price: price.trim(),
      items: Array.isArray(items) ? items : [],
      highlight: !!highlight,
      order: nextOrder,
    });

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ success: false, error: 'Dịch vụ này đã tồn tại.' }, { status: 409 });
    }
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
