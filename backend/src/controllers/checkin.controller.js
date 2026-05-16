const asyncHandler = require("express-async-handler");
const Goal = require("../models/Goal");
const { httpError } = require("../utils/helpers");
const { logAudit } = require("../services/audit.service");
const { syncSharedAchievement } = require("../services/shared.service");

exports.submit = asyncHandler(async (req, res) => {
  const { goal_id } = req.params;
  const { quarter, planned, achieved, status, comments } = req.body || {};
  
  if (!quarter || status == null) {
    throw httpError(400, "quarter and status are required");
  }

  const g = await Goal.findOne({ id: goal_id });
  if (!g) throw httpError(404, "Not found");
  
  const me = req.user;
  if (g.employee_id !== me.id && me.role !== "admin") {
    throw httpError(403, "Forbidden");
  }

  const updates = g.quarterly_updates || [];
  const idx = updates.findIndex((u) => u.quarter === quarter);
  const next = {
    quarter,
    planned: Number(planned || 0),
    achieved: Number(achieved || 0),
    status,
    comments: comments || "",
    updated_at: new Date()
  };

  const old = idx >= 0 ? updates[idx] : null;
  if (idx >= 0) updates[idx] = next;
  else updates.push(next);

  g.quarterly_updates = updates;
  g.status = status; // Sync overall status with last check-in
  await g.save();

  await logAudit({
    user_id: me.id, action: "submit_checkin", target_type: "goal", target_id: g.id,
    old_value: old, new_value: next
  });

  let synced = 0;
  if (g.shared_goal_id) {
    const res = await syncSharedAchievement(g);
    synced = res.synced;
  }

  res.json({ ok: true, shared_synced_count: synced });
});

exports.addManagerComment = asyncHandler(async (req, res) => {
  const { goal_id } = req.params;
  const { quarter, comment } = req.body || {};
  
  if (!quarter || comment == null) {
    throw httpError(400, "quarter and comment are required");
  }

  const g = await Goal.findOne({ id: goal_id });
  if (!g) throw httpError(404, "Not found");
  
  const me = req.user;
  if (me.role !== "manager" && me.role !== "admin") {
    throw httpError(403, "Only managers or admins can comment");
  }

  const updates = g.quarterly_updates || [];
  const idx = updates.findIndex((u) => u.quarter === quarter);
  if (idx < 0) {
    throw httpError(400, "Check-in not found for this quarter. Employee must submit it first.");
  }

  updates[idx].manager_comments = comment;
  g.quarterly_updates = updates;
  g.markModified("quarterly_updates");
  await g.save();

  await logAudit({
    user_id: me.id, action: "add_manager_comment", target_type: "goal", target_id: g.id,
    new_value: { quarter, comment }
  });

  res.json({ ok: true });
});
