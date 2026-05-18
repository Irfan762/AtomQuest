const asyncHandler = require("express-async-handler");
const Goal = require("../models/Goal");
const { httpError } = require("../utils/helpers");
const { logAudit } = require("../services/audit.service");
const { syncSharedAchievement } = require("../services/shared.service");

exports.submit = asyncHandler(async (req, res) => {
  const { goal_id } = req.params;
  const { quarter, planned, achieved, status, comments, mood = null } = req.body || {};
  
  if (!quarter || status == null) {
    throw httpError(400, "quarter and status are required");
  }

  const g = await Goal.findOne({ id: goal_id });
  if (!g) throw httpError(404, "Not found");
  
  const me = req.user;
  const isOwner = g.employee_id === me.id;
  const isAdmin = me.role === "admin";

  // Managers can submit check-ins on behalf of their direct reports
  let isTeamManager = false;
  if (!isOwner && !isAdmin && me.role === "manager") {
    const emp = await (require("../models/User")).findOne({ id: g.employee_id }).lean();
    isTeamManager = emp && emp.manager_id === me.id;
  }

  if (!isOwner && !isAdmin && !isTeamManager) {
    throw httpError(403, "Forbidden");
  }

  const updates = g.quarterly_updates || [];
  const idx = updates.findIndex((u) => u.quarter === quarter);
  const next = {
    quarter,
    planned: Number(planned || 0),
    achieved: Number(achieved || 0),
    status,
    mood,
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

  // Wellbeing Alert Trigger
  if (mood && ["struggling", "blocked"].includes(mood)) {
    try {
      const User = require("../models/User");
      const employee = await User.findOne({ id: g.employee_id }).lean();
      if (employee && employee.manager_id) {
        const manager = await User.findOne({ id: employee.manager_id }).lean();
        if (manager) {
          const { sendEmail } = require("../services/email.service");
          await sendEmail({
            to_user: manager.id,
            to_email: manager.email,
            type: "wellbeing_alert",
            subject: `🚨 Urgent Wellbeing Alert: ${employee.name} is ${mood.toUpperCase()}`,
            body: `Hi ${manager.name},\n\nYour team member ${employee.name} has submitted a quarterly check-in indicating they are "${mood === "struggling" ? "Struggling & needing support" : "Blocked & needing urgent help"}".\n\nGoal: "${g.title}"\nQuarter: ${quarter}\nPlanned: ${planned}\nAchieved: ${achieved}\nComments: "${comments || "(no comments)"}"\n\nPlease reach out to them immediately to provide necessary support.`,
          });
        }
      }
    } catch (err) {
      console.error("[goalgrid] Failed to send wellbeing alert:", err.message);
    }
  }

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
