import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILayout extends Document {
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  fileSize: number;
  order: number;
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
    order: {
      type: Number,
      required: true,
      unique: true,
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
