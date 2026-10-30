import AuditLog from '../../models/auditLog.model.js';

export const logActivity = (data) => {
  AuditLog.create(data).catch((err) => {});
};
export default logActivity;