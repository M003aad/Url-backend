import mongoose from 'mongoose';

const sessionschema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sessionschema.index({ userId: 1 }, { unique: true });

const Session = mongoose.model('Session', sessionschema);

export default Session;
