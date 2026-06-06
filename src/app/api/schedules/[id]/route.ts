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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { date, startTime, endTime, isFullDay, note } = body as {
      date?: string;
      startTime?: string;
      endTime?: string;
      isFullDay?: boolean;
      note?: string;
    };

    const current = await Schedule.findById(id);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy lịch bận.' }, { status: 404 });
    }

    // Validate original date is not in the past
    const today = getTodayVN();
    if (current.date < today) {
      return NextResponse.json({ success: false, error: 'Không thể chỉnh sửa lịch bận của ngày trong quá khứ.' }, { status: 400 });
    }

    const update: Record<string, unknown> = {};

    if (date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ success: false, error: 'Định dạng ngày phải là YYYY-MM-DD.' }, { status: 400 });
      }
      if (date < today) {
        return NextResponse.json({ success: false, error: 'Không thể đổi lịch sang ngày trong quá khứ.' }, { status: 400 });
      }
      update.date = date;
    }

    if (isFullDay !== undefined) {
      update.isFullDay = !!isFullDay;
    }

    if (note !== undefined) {
      update.note = note.trim();
    }

    // Resolve times
    const nextDate = date || current.date;
    const nextIsFullDay = isFullDay !== undefined ? !!isFullDay : current.isFullDay;
    let nextStartTime = startTime !== undefined ? startTime : current.startTime;
    let nextEndTime = endTime !== undefined ? endTime : current.endTime;

    if (nextIsFullDay) {
      nextStartTime = '00:00';
      nextEndTime = '23:59';
    } else {
      const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(nextStartTime) || !timeRegex.test(nextEndTime)) {
        return NextResponse.json({ success: false, error: 'Định dạng giờ phải là HH:MM.' }, { status: 400 });
      }
      if (timeToMinutes(nextStartTime) >= timeToMinutes(nextEndTime)) {
        return NextResponse.json({ success: false, error: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.' }, { status: 400 });
      }
    }

    update.startTime = nextStartTime;
    update.endTime = nextEndTime;

    // Overlap checks
    const startNew = timeToMinutes(nextStartTime);
    const endNew = timeToMinutes(nextEndTime);

    const existingSchedules = await Schedule.find({ date: nextDate }).lean();
    for (const sched of existingSchedules) {
      if (sched._id.toString() === id) continue; // skip self

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

    const updated = await Schedule.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

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

    const current = await Schedule.findById(id);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy lịch bận.' }, { status: 404 });
    }

    // Validate date is not in the past
    const today = getTodayVN();
    if (current.date < today) {
      return NextResponse.json({ success: false, error: 'Không thể xóa lịch bận của ngày trong quá khứ.' }, { status: 400 });
    }

    await Schedule.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Đã giải phóng lịch bận.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
