import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  name: string;
  price: string;
  items: string[];
  highlight: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema<IService> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên dịch vụ là bắt buộc'],
      unique: true,
      trim: true,
    },
    price: {
      type: String,
      required: [true, 'Giá dịch vụ là bắt buộc'],
      trim: true,
    },
    items: {
      type: [String],
      default: [],
    },
    highlight: {
      type: Boolean,
      default: false,
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

const Service: Model<IService> =
  mongoose.models.Service ||
  mongoose.model<IService>('Service', ServiceSchema);

export default Service;
