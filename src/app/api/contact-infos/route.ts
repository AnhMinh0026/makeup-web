import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactInfo from '@/models/ContactInfo';

const DEFAULT_CONTACTS = [
  {
    icon: '📱',
    label: 'Điện thoại / Zalo',
    value: '0909 xxx xxx',
    sub: 'Giờ làm việc: 8:00 – 20:00',
    link: 'https://zalo.me/0909xxxxxx',
    order: 1,
  },
  {
    icon: '📘',
    label: 'Facebook',
    value: 'Emisa Makeup Artist',
    sub: 'fb.com/emisamakeup',
    link: 'https://fb.com/emisamakeup',
    order: 2,
  },
  {
    icon: '📸',
    label: 'Instagram',
    value: '@emisa.makeup',
    sub: 'Portfolio đầy đủ tại Instagram',
    link: 'https://instagram.com/emisa.makeup',
    order: 3,
  },
  {
    icon: '📍',
    label: 'Studio',
    value: 'TP. Hồ Chí Minh',
    sub: 'Hỗ trợ makeup tại nhà & studio',
    link: '',
    order: 4,
  },
  {
    icon: '✉️',
    label: 'Email',
    value: 'hello@emisamakeup.vn',
    sub: 'Phản hồi trong vòng 24h',
    link: 'mailto:hello@emisamakeup.vn',
    order: 5,
  },
];

export async function GET() {
  try {
    await connectDB();
    let contacts = await ContactInfo.find({}).sort({ order: 1, createdAt: 1 }).lean();

    if (contacts.length === 0) {
      await ContactInfo.insertMany(DEFAULT_CONTACTS);
      contacts = await ContactInfo.find({}).sort({ order: 1, createdAt: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { icon, label, value, sub, link, order } = body as {
      icon?: string;
      label?: string;
      value?: string;
      sub?: string;
      link?: string;
      order?: number;
    };

    if (!label || !label.trim()) {
      return NextResponse.json({ success: false, error: 'Nhãn liên hệ là bắt buộc.' }, { status: 400 });
    }
    if (!value || !value.trim()) {
      return NextResponse.json({ success: false, error: 'Giá trị liên hệ là bắt buộc.' }, { status: 400 });
    }

    // Determine order
    let nextOrder = order;
    if (order === undefined) {
      const lastContact = await ContactInfo.findOne({}).sort({ order: -1 }).lean();
      nextOrder = lastContact ? (lastContact.order ?? 0) + 1 : 1;
    }

    const contact = await ContactInfo.create({
      icon: icon?.trim() || '📱',
      label: label.trim(),
      value: value.trim(),
      sub: sub?.trim() || '',
      link: link?.trim() || '',
      order: nextOrder,
    });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
