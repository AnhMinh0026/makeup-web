import mongoose, { Schema, Document, Model } from 'mongoose';

export type BlockLayoutType = '1col' | '2col' | '3col';

export const LAYOUT_PHOTO_COUNT: Record<BlockLayoutType, number> = {
  '1col': 1,
  '2col': 2,
  '3col': 3,
};

export interface IPhotoBlock extends Document {
  photos: mongoose.Types.ObjectId[];
  layoutType: BlockLayoutType;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoBlockSchema: Schema<IPhotoBlock> = new Schema(
  {
    photos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Layout',
        required: true,
      },
    ],
    layoutType: {
      type: String,
      enum: ['1col', '2col', '3col'],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PhotoBlock: Model<IPhotoBlock> =
  mongoose.models.PhotoBlock ||
  mongoose.model<IPhotoBlock>('PhotoBlock', PhotoBlockSchema);

export default PhotoBlock;
