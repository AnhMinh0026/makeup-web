import mongoose, { Schema, Document, Model } from 'mongoose';
import { LayoutCategory, LAYOUT_CATEGORIES } from '@/lib/categories';

export type { LayoutCategory };
export { LAYOUT_CATEGORIES };

export interface ILayout extends Document {
  title: string;
  description?: string;
  category: LayoutCategory;
  imageUrl: string;
  featured: boolean;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const LayoutSchema: Schema<ILayout> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the makeup layout'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: LAYOUT_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      default: 'MAKEUP CONCEPT',
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompiling the model when Next.js hot-reloads in development
const Layout: Model<ILayout> =
  mongoose.models.Layout || mongoose.model<ILayout>('Layout', LayoutSchema);

export default Layout;
