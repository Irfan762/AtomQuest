const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  target_type: {
    type: String,
    required: true
  },
  target_id: {
    type: String,
    required: true
  },
  old_value: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  new_value: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
