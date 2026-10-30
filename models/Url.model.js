import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    urlCode: {
      type: String,
      required: true,
      unique: true, // unique بوحدها كافية وتنشئ B-Tree Index تلقائياً
      trim: true,
    },
    shortUrl: {
      type: String,
      required: true,
      trim: true,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

urlSchema.index({ userId: 1, createdAt: -1 });

const Url = mongoose.model('Url', urlSchema);

export default Url;