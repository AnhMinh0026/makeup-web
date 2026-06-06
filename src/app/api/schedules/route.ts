import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Schedule from '@/models/Schedule';

function getTodayVN(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export async function GET() {
  try {
    await connectDB();
    const schedules = await Schedule.find({}).sort({ date: 1, startTime: 1 }).lean();
    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { date, isFullDay, note } = body as {
      date?: string;
      startTime?: string;
      endTime?: string;
      isFullDay?: boolean;
      note?: string;
    };

    let startTime = body.startTime || '00:00';
    let endTime = body.endTime || '23:59';

    if (!date) {
      return NextResponse.json({ success: false, error: 'Ngày bận là bắt buộc.' }, { status: 400 });
    }

    // Check date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ success: false, error: 'Định dạng ngày phải là YYYY-MM-DD.' }, { status: 400 });
    }

    // Validate past dates (Vietnam timezone)
    const today = getTodayVN();
    if (date < today) {
      return NextResponse.json({ success: false, error: 'Không thể đặt lịch bận cho các ngày trong quá khứ.' }, { status: 400 });
    }

    if (isFullDay) {
      startTime = '00:00';
      endTime = '23:59';
    } else {
      // Validate time format
      const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return NextResponse.json({ success: false, error: 'Định dạng giờ phải là HH:MM (00:00 đến 23:59).' }, { status: 400 });
      }

      const startMin = timeToMinutes(startTime);
      const endMin = timeToMinutes(endTime);

      if (startMin >= endMin) {
        return NextResponse.json({ success: false, error: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.' }, { status: 400 });
      }
    }

    const startNew = timeToMinutes(startTime);
    const endNew = timeToMinutes(endTime);

    // Overlap checks
    const existingSchedules = await Schedule.find({ date }).lean();
    for (const sched of existingSchedules) {
      const startExist = timeToMinutes(sched.startTime);
      const endExist = timeToMinutes(sched.endTime);

      if (startNew < endExist && startExist < endNew) {
        const timeDesc = sched.isFullDay
          ? 'Cả ngày'
          : `${sched.startTime} - ${sched.endTime}`;
        return NextResponse.json({
          success: false,
          error: `Khung giờ trùng lặp với lịch bận đã có: ${timeDesc} (${sched.note || 'Không có ghi chú'})`,
        }, { status: 400 });
      }
    }

    const newSchedule = await Schedule.create({
      date,
      startTime,
      endTime,
      isFullDay: !!isFullDay,
      note: note?.trim() || '',
    });

    return NextResponse.json({ success: true, data: newSchedule }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
