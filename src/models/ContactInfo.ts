import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactInfo extends Document {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  link?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContactInfoSchema: Schema<IContactInfo> = new Schema(
  {
    icon: {
      type: String,
      default: '📱',
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Nhãn liên hệ là bắt buộc'],
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Giá trị liên hệ là bắt buộc'],
      trim: true,
    },
    sub: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ContactInfo: Model<IContactInfo> =
  mongoose.models.ContactInfo ||
  mongoose.model<IContactInfo>('ContactInfo', ContactInfoSchema);

export default ContactInfo;
