const asyncHandler = require("express-async-handler");
const Goal = require("../models/Goal");
const User = require("../models/User");
const { httpError } = require("../utils/helpers");
const { serializeGoal } = require("../services/progress.service");
const { logAudit } = require("../services/audit.service");
const {
  notifyGoalSubmitted,
  notifyGoalApproved,
  notifyGoalRejected,
} = require("../services/email.service");

async function validateCanAdd(employee_id, weightage, excludeGoalId = null) {
  const q = { employee_id, approval_status: { $ne: "rejected" } };
  if (excludeGoalId) q.id = { $ne: excludeGoalId };
  const existing = await Goal.find(q).select("weightage").lean();
  const total = existing.reduce((s, g) => s + Number(g.weightage || 0), 0) + Number(weightage);
  if (total > 100) {
    throw httpError(400, `Total weightage would exceed 100% (current: ${total}%)`);
  }
  if (!excludeGoalId) {
    const count = await Goal.countDocuments(q);
    if (count >= 8) throw httpError(400, "Maximum 8 goals allowed per employee");
  }
}

exports.create = asyncHandler(async (req, res) => {
  const {
    title, description = "", thrust_area, uom_type = "numeric",
    target, weightage, deadline, progress_direction = "max",
    parentGoalId = null, startDate,
  } = req.body || {};
  if (!title || !thrust_area || target == null || weightage == null || !deadline) {
    throw httpError(400, "title, thrust_area, target, weightage and deadline are required");
  }
  if (Number(weightage) < 10 || Number(weightage) > 100) {
    throw httpError(400, "Weightage must be between 10 and 100");
  }
  await validateCanAdd(req.user.id, weightage);
  const goal = await Goal.create({
    employee_id: req.user.id,
    title, description, thrust_area, uom_type,
    target: Number(target), weightage: Number(weightage),
    deadline: new Date(deadline), progress_direction,
    parentGoalId,
    startDate: startDate ? new Date(startDate) : new Date(),
  });
  await logAudit({
    user_id: req.user.id, action: "create_goal", target_type: "goal", target_id: goal.id,
    new_value: { title: goal.title },
  });
  res.json(serializeGoal(goal));
});

exports.list = asyncHandler(async (req, res) => {
  const me = req.user;
  const { employee_id } = req.query;
  let q;
  if (me.role === "admin") {
    q = employee_id ? { employee_id } : {};
  } else if (me.role === "manager") {
    const team = await User.find({ manager_id: me.id }).select("id").lean();
    const ids = [...team.map((t) => t.id), me.id];
    if (employee_id) {
      if (!ids.includes(employee_id)) throw httpError(403, "Forbidden");
      q = { employee_id };
    } else {
      q = { employee_id: { $in: ids } };
    }
  } else {
    q = { employee_id: me.id };
  }
  const goals = await Goal.find(q).lean();
  res.json(goals.map(serializeGoal));
});

exports.getOne = asyncHandler(async (req, res) => {
  const g = await Goal.findOne({ id: req.params.goal_id }).lean();
  if (!g) throw httpError(404, "Not found");
  res.json(serializeGoal(g));
});

exports.update = asyncHandler(async (req, res) => {
  const g = await Goal.findOne({ id: req.params.goal_id });
  if (!g) throw httpError(404, "Not found");
  const me = req.user;
  const isOwner = g.employee_id === me.id;
  const isManager = me.role === "manager";
  const isAdmin = me.role === "admin";

  if (g.locked && !isAdmin) throw httpError(403, "Goal is locked. Only admin can edit.");
  if (isOwner && g.approval_status === "approved" && !isAdmin) {
    throw httpError(403, "Approved goals cannot be edited by employee");
  }
  if (!(isOwner || isManager || isAdmin)) throw httpError(403, "Forbidden");

  const updates = {};
  const allowedAll = ["title", "description", "thrust_area", "uom_type", "target", "weightage", "deadline", "progress_direction", "parentGoalId", "startDate"];
  for (const k of allowedAll) if (k in (req.body || {})) updates[k] = req.body[k];

  if (g.shared_goal_id && isOwner && !isAdmin) {
    const keys = Object.keys(updates);
    if (keys.some((k) => k !== "weightage")) {
      throw httpError(400, "Shared goal: only weightage can be changed by employee");
    }
  }

  if (updates.weightage != null) {
    if (Number(updates.weightage) < 10 || Number(updates.weightage) > 100) {
      throw httpError(400, "Weightage must be between 10 and 100");
    }
    await validateCanAdd(g.employee_id, updates.weightage, g.id);
  }
  if (updates.deadline) updates.deadline = new Date(updates.deadline);
  if (updates.startDate) updates.startDate = new Date(updates.startDate);

  const before = g.toObject();
  Object.assign(g, updates);
  await g.save();

  await logAudit({
    user_id: me.id, action: "update_goal", target_type: "goal", target_id: g.id,
    old_value: before, new_value: updates,
  });
  res.json(serializeGoal(g));
});

exports.remove = asyncHandler(async (req, res) => {
  const g = await Goal.findOne({ id: req.params.goal_id });
  if (!g) throw httpError(404, "Not found");
  const me = req.user;
  if (g.locked && me.role !== "admin") throw httpError(403, "Goal is locked");
  if (me.role !== "admin" && g.employee_id !== me.id) throw httpError(403, "Forbidden");
  if (g.approval_status === "approved" && me.role !== "admin") {
    throw httpError(403, "Approved goals cannot be deleted by employee");
  }
  const before = g.toObject();
  await Goal.deleteOne({ id: g.id });
  await logAudit({
    user_id: me.id, action: "delete_goal", target_type: "goal", target_id: g.id,
    old_value: before,
  });
  res.json({ ok: true });
});

exports.submit = asyncHandler(async (req, res) => {
  const g = await Goal.findOne({ id: req.params.goal_id });
  if (!g) throw httpError(404, "Not found");
  if (g.employee_id !== req.user.id) throw httpError(403, "Forbidden");
  if (g.locked) throw httpError(403, "Locked");

  const all = await Goal.find({ employee_id: g.employee_id, approval_status: { $ne: "rejected" } }).select("weightage").lean();
  const total = all.reduce((s, x) => s + Number(x.weightage || 0), 0);
  if (total !== 100) throw httpError(400, `Total weightage must equal 100% before submission (current: ${total}%)`);

  const before = g.approval_status;
  g.approval_status = "submitted";
  await g.save();
  await logAudit({
    user_id: req.user.id, action: "submit_goal", target_type: "goal", target_id: g.id,
    old_value: before, new_value: "submitted",
  });

  const employee = await User.findOne({ id: g.employee_id }).lean();
  if (employee?.manager_id) {
    const manager = await User.findOne({ id: employee.manager_id }).lean();
    await notifyGoalSubmitted({ employee, manager, goal: g });
  }
  res.json({ ok: true });
});

exports.approve = asyncHandler(async (req, res) => {
  const g = await Goal.findOne({ id: req.params.goal_id });
  if (!g) throw httpError(404, "Not found");
  const me = req.user;
  if (me.role === "manager") {
    const emp = await User.findOne({ id: g.employee_id }).lean();
    if (!emp || emp.manager_id !== me.id) throw httpError(403, "Not your team member");
  }
  const before = g.approval_status;
  g.approval_status = "approved";
  g.locked = true;
  g.manager_comments = (req.body || {}).comments || "";
  await g.save();
  await logAudit({
    user_id: me.id, action: "approve_goal", target_type: "goal", target_id: g.id,
    old_value: before, new_value: "approved",
  });
  const employee = await User.findOne({ id: g.employee_id }).lean();
  await notifyGoalApproved({ employee, goal: g });

  // Trigger AI Goal Conflict Detector automatically!
  try {
    const { runConflictDetectorInternal } = require("../services/conflict.service");
    await runConflictDetectorInternal();
  } catch (err) {
    console.error("[goalgrid] Auto conflict detection failed:", err.message);
  }

  res.json({ ok: true });
});

exports.reject = asyncHandler(async (req, res) => {
  const g = await Goal.findOne({ id: req.params.goal_id });
  if (!g) throw httpError(404, "Not found");
  const me = req.user;
  if (me.role === "manager") {
    const emp = await User.findOne({ id: g.employee_id }).lean();
    if (!emp || emp.manager_id !== me.id) throw httpError(403, "Not your team member");
  }
  const before = g.approval_status;
  const comments = (req.body || {}).comments || "";
  g.approval_status = "rejected";
  g.manager_comments = comments;
  await g.save();
  await logAudit({
    user_id: me.id, action: "reject_goal", target_type: "goal", target_id: g.id,
    old_value: before, new_value: "rejected",
  });
  const employee = await User.findOne({ id: g.employee_id }).lean();
  await notifyGoalRejected({ employee, goal: g, comments });
  res.json({ ok: true });
});

exports.pushShared = asyncHandler(async (req, res) => {
  const {
    employee_ids = [], title, description = "", thrust_area, uom_type = "numeric",
    target, weightage, deadline, progress_direction = "max",
  } = req.body || {};
  if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
    throw httpError(400, "employee_ids must be a non-empty array");
  }
  if (!title || !thrust_area || target == null || weightage == null || !deadline) {
    throw httpError(400, "Missing required goal fields");
  }
  const { randomUUID } = require("crypto");
  const shared_id = randomUUID();
  const created = [];
  const skipped = [];
  for (const emp_id of employee_ids) {
    try {
      await validateCanAdd(emp_id, weightage);
    } catch (e) {
      skipped.push({ employee_id: emp_id, reason: e.message });
      continue;
    }
    const g = await Goal.create({
      employee_id: emp_id,
      title, description, thrust_area, uom_type,
      target: Number(target), weightage: Number(weightage),
      deadline: new Date(deadline), progress_direction,
      approval_status: "submitted",
      manager_comments: "Shared KPI",
      shared_goal_id: shared_id,
    });
    created.push(g.id);
    await logAudit({
      user_id: req.user.id, action: "push_shared_goal", target_type: "goal", target_id: g.id,
      new_value: { shared_id },
    });
  }
  res.json({ shared_id, created_goal_ids: created, skipped });
});

// ==========================================
// 5 UNIQUE ENTERPRISE FEATURES ACTIONS
// ==========================================

const Conflict = require("../models/Conflict");
const Scenario = require("../models/Scenario");

exports.alignmentTree = asyncHandler(async (req, res) => {
  const goals = await Goal.find({}).lean();
  const users = await User.find({ is_deleted: false }).select("id name role department").lean();
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  // Calculate alignment score
  const employeeGoals = goals.filter(g => userMap[g.employee_id]?.role === "employee");
  const alignedEmployeeGoals = employeeGoals.filter(g => g.parentGoalId);
  const alignmentScore = employeeGoals.length 
    ? Math.round((alignedEmployeeGoals.length / employeeGoals.length) * 100) 
    : 100;

  res.json({
    goals: goals.map(serializeGoal),
    users: userMap,
    alignmentScore
  });
});

exports.timeline = asyncHandler(async (req, res) => {
  const { department, employee_id, status, quarter } = req.query;
  
  let userQuery = { is_deleted: false };
  if (department) {
    userQuery.department = department;
  }
  const users = await User.find(userQuery).select("id name role department").lean();
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const userIds = users.map(u => u.id);

  let goalQuery = { employee_id: { $in: userIds } };
  if (employee_id) {
    goalQuery.employee_id = employee_id;
  }
  if (status) {
    goalQuery.status = status;
  }
  
  let goals = await Goal.find(goalQuery).lean();

  if (quarter) {
    // Filter goals that have checkins/activity in that specific quarter
    goals = goals.filter(g => {
      if (!g.quarterly_updates || g.quarterly_updates.length === 0) return quarter === "Q1";
      return g.quarterly_updates.some(q => q.quarter === quarter);
    });
  }

  res.json(goals.map(serializeGoal));
});

exports.detectConflicts = asyncHandler(async (req, res) => {
  const { runConflictDetectorInternal } = require("../services/conflict.service");
  const conflicts = await runConflictDetectorInternal();
  res.json({ ok: true, count: conflicts.length, conflicts });
});

exports.listConflicts = asyncHandler(async (req, res) => {
  const conflicts = await Conflict.find({}).sort({ created_at: -1 }).lean();
  res.json(conflicts);
});

exports.resolveConflict = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conflict = await Conflict.findOne({ id });
  if (!conflict) throw httpError(404, "Conflict not found");

  conflict.resolved = true;
  conflict.resolved_by = req.user.name || req.user.role;
  await conflict.save();

  res.json({ ok: true, conflict });
});

exports.listScenarios = asyncHandler(async (req, res) => {
  const scenarios = await Scenario.find({ manager_id: req.user.id }).sort({ created_at: -1 }).lean();
  res.json(scenarios);
});

exports.saveScenario = asyncHandler(async (req, res) => {
  const { name, description = "", sliders, department = "", dept_impact = 0, org_impact = 0 } = req.body || {};
  if (!name || !sliders) throw httpError(400, "name and sliders are required");

  const scenario = await Scenario.create({
    name,
    description,
    manager_id: req.user.id,
    sliders,
    department,
    dept_impact,
    org_impact
  });

  res.json({ ok: true, scenario });
});

exports.deleteScenario = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Scenario.deleteOne({ id, manager_id: req.user.id });
  res.json({ ok: true });
});
