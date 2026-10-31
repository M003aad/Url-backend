import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      email: { type: String, default: 'GUEST' },
    },

    action: {
      type: String,
      required: true,
      enum: [
        'NOT_FOUND',
        'VALIDATION',
        'AUTH_LOGIN',
        'AUTH_LOGOUT',
        'AUTH_LOGOUTFROMALL',
        'AUTH_ACTIVATE',
        'AUTH_RESEND_ACTIVATE',
        'AUTH_RESET_PASSWORD',
        'AUTH_FORGET_PASSWORD',
        'AUTH_REGISTER',
        'AUTH_REFRESH',
        'AUTH_PROTECT',
        'USER_GET_PROFILE',
        'USER_CHANGE_PASSWORD',
        'USER_DELETE_PROFILE',
        'USER_UPDATE_PROFILE',
        'URL_CREATE',
        'URL_REDIRECT',
        'URL_GET_ALL_URL',
        'URL_DELETE',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },

    target: {
      entity: { type: String },
      entityId: { type: String },
    },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed, default: null }, // القيمة قبل التعديل
      after: { type: mongoose.Schema.Types.Mixed, default: null },  // القيمة بعد التعديل
    },

    context: {
      ip: { type: String, required: true },
      deviceType: { type: String, required: true },
      browser: { type: String },
      userAgent: { type: String },
    },

    failureReason: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, 
    versionKey: false,
  }
);

auditLogSchema.index({ 'actor.userId': 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;