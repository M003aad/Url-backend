import AuditLog from "../../models/AuditLog.model.js";

export const logActivity = (data) => {
  AuditLog.create(data).catch((err) => {});
};
export default logActivity;