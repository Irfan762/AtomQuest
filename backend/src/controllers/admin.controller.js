const asyncHandler = require("express-async-handler");
const Goal = require("../models/Goal");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { httpError } = require("../utils/helpers");
const { logAudit } = require("../services/audit.service");

exports.unlock = asyncHandler(async (req, res) => {
  const g = await Goal.findOne({ id: req.params.goal_id });
  if (!g) throw httpError(404, "Not found");
  const reason = (req.body || {}).reason || "";
  g.locked = false;
  g.approval_status = "draft";
  await g.save();
  await logAudit({
    user_id: req.user.id, action: "unlock_goal", target_type: "goal", target_id: g.id,
    old_value: { locked: true }, new_value: { locked: false, reason },
  });
  res.json({ ok: true });
});

exports.audit = asyncHandler(async (_req, res) => {
  const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(500).lean();
  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))];
  const users = await User.find({ id: { $in: userIds } }).select("id name email").lean();
  const umap = Object.fromEntries(users.map((u) => [u.id, u]));
  const enriched = logs.map((l) => ({
    ...l,
    _id: undefined,
    user_name: umap[l.user_id]?.name || "Unknown",
    user_email: umap[l.user_id]?.email || "",
  }));
  res.json(enriched);
});
