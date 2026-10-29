import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Session from './Session.model.js';
import ResetToken from './ResetToken.model.js';
import ActivationToken from './ActivationToken.model.js';
import Url from './Url.model.js';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 604800,
    partialFilterExpression: { deletedAt: { $type: 'date' } },
  },
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Soft Delete Method
userSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();

  await Promise.all([
    Session.deleteMany({ userId: this._id }),
    ResetToken.deleteMany({ user: this._id }),
    ActivationToken.deleteMany({ user: this._id }),
    Url.deleteMany({ userId: this._id }),
  ]);

  return this.save();
};

// Exclude deleted users automatically
userSchema.pre(/^find/, function () {
  if (!this.getFilter().hasOwnProperty('deletedAt')) {
    this.where({ deletedAt: null });
  }
});

// Static Methods
userSchema.statics.findActiveById = function (id, projection = null) {
  return this.findOne({ _id: id, emailVerified: true, deletedAt: null }, projection);
};

// Hard Delete Hook
userSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const userId = this._id;
  await Promise.all([
    Session.deleteMany({ userId }),
    ResetToken.deleteMany({ user: userId }),
    ActivationToken.deleteMany({ user: userId }),
    Url.deleteMany({ userId: userId }),
  ]);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
