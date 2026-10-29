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
      unique: true,
      index: true,
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

const Url = mongoose.model('Url', urlSchema);

export default Url;
