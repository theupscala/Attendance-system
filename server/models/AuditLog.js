const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'MANUAL_ATTENDANCE', 'OVERTIME_CONVERSION', 'DELETE_EMPLOYEE'
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // the employee affected
  details: { type: mongoose.Schema.Types.Mixed }, // flexible JSON object for changes
  ipAddress: { type: String }
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
