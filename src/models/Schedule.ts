import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchedule extends Document {
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  isFullDay: boolean;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema<ISchedule> = new Schema(
  {
    date: {
      type: String,
      required: [true, 'Ngày bận là bắt buộc'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày phải là YYYY-MM-DD'],
    },
    startTime: {
      type: String,
      required: [true, 'Giờ bắt đầu là bắt buộc'],
      trim: true,
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ phải là HH:MM'],
      default: '00:00',
    },
    endTime: {
      type: String,
      required: [true, 'Giờ kết thúc là bắt buộc'],
      trim: true,
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ phải là HH:MM'],
      default: '23:59',
    },
    isFullDay: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index to allow quick queries for a date
ScheduleSchema.index({ date: 1 });

// Force rebuild model to apply latest schema changes in Next.js dev server
if (mongoose.models.Schedule) {
  delete (mongoose.models as Record<string, unknown>).Schedule;
}

const Schedule: Model<ISchedule> = mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;
