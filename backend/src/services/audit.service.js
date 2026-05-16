const AuditLog = require("../models/AuditLog");

async function logAudit({ user_id, action, target_type, target_id, old_value = null, new_value = null }) {
  try {
    await AuditLog.create({ user_id, action, target_type, target_id, old_value, new_value });
  } catch (err) {
    console.error("[goalgrid] audit failed:", err.message);
  }
}

module.exports = { logAudit };
