import mongoose, { Schema, Document, Model } from 'mongoose';

export type DisplayMode = '3col' | '2col' | '1col';

export interface ISettings extends Document {
  key: string;           // singleton key = 'global'
  displayMode: DisplayMode;
  updatedAt: Date;
}

const SettingsSchema: Schema<ISettings> = new Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
    },
    displayMode: {
      type: String,
      enum: ['3col', '2col', '1col'],
      default: '3col',
    },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
