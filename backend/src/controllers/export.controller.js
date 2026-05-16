const asyncHandler = require("express-async-handler");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const Goal = require("../models/Goal");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { computeProgress } = require("../services/progress.service");

async function scopedGoals(user) {
  if (user.role === "admin") return Goal.find({}).lean();
  if (user.role === "manager") {
    const team = await User.find({ manager_id: user.id }).select("id").lean();
    const ids = [...team.map((t) => t.id), user.id];
    return Goal.find({ employee_id: { $in: ids } }).lean();
  }
  return Goal.find({ employee_id: user.id }).lean();
}

exports.goalsCsv = asyncHandler(async (req, res) => {
  const goals = await scopedGoals(req.user);
  const userIds = [...new Set(goals.map((g) => g.employee_id))];
  const users = await User.find({ id: { $in: userIds } }).select("id name email department").lean();
  const umap = Object.fromEntries(users.map((u) => [u.id, u]));

  const rows = goals.map((g) => ({
    goal_id: g.id,
    employee_name: umap[g.employee_id]?.name || "",
    employee_email: umap[g.employee_id]?.email || "",
    department: umap[g.employee_id]?.department || "",
    title: g.title,
    thrust_area: g.thrust_area,
    uom_type: g.uom_type,
    target: g.target,
    weightage: g.weightage,
    deadline: g.deadline?.toISOString?.() || g.deadline,
    progress_direction: g.progress_direction,
    progress_pct: computeProgress(g),
    status: g.status,
    approval_status: g.approval_status,
    locked: g.locked,
    shared_goal_id: g.shared_goal_id || "",
    manager_comments: g.manager_comments || "",
    q1_planned: g.quarterly_updates?.find((q) => q.quarter === "Q1")?.planned ?? "",
    q1_achieved: g.quarterly_updates?.find((q) => q.quarter === "Q1")?.achieved ?? "",
    q2_planned: g.quarterly_updates?.find((q) => q.quarter === "Q2")?.planned ?? "",
    q2_achieved: g.quarterly_updates?.find((q) => q.quarter === "Q2")?.achieved ?? "",
    q3_planned: g.quarterly_updates?.find((q) => q.quarter === "Q3")?.planned ?? "",
    q3_achieved: g.quarterly_updates?.find((q) => q.quarter === "Q3")?.achieved ?? "",
    q4_planned: g.quarterly_updates?.find((q) => q.quarter === "Q4")?.planned ?? "",
    q4_achieved: g.quarterly_updates?.find((q) => q.quarter === "Q4")?.achieved ?? "",
  }));

  const parser = new Parser({ fields: Object.keys(rows[0] || { goal_id: "" }) });
  const csv = rows.length ? parser.parse(rows) : "goal_id\n";
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="goals.csv"');
  res.send(csv);
});

exports.goalsXlsx = asyncHandler(async (req, res) => {
  const goals = await scopedGoals(req.user);
  const userIds = [...new Set(goals.map((g) => g.employee_id))];
  const users = await User.find({ id: { $in: userIds } }).select("id name email department").lean();
  const umap = Object.fromEntries(users.map((u) => [u.id, u]));

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Goals");
  ws.columns = [
    { header: "Employee", key: "employee" },
    { header: "Email", key: "email" },
    { header: "Department", key: "department" },
    { header: "Title", key: "title" },
    { header: "Thrust", key: "thrust_area" },
    { header: "UoM", key: "uom_type" },
    { header: "Target", key: "target" },
    { header: "Weight %", key: "weightage" },
    { header: "Deadline", key: "deadline" },
    { header: "Progress %", key: "progress_pct" },
    { header: "Status", key: "status" },
    { header: "Approval", key: "approval_status" },
    { header: "Locked", key: "locked" },
    { header: "Manager comments", key: "mc" },
  ];
  ws.getRow(1).font = { bold: true };
  for (const g of goals) {
    ws.addRow({
      employee: umap[g.employee_id]?.name || "",
      email: umap[g.employee_id]?.email || "",
      department: umap[g.employee_id]?.department || "",
      title: g.title,
      thrust_area: g.thrust_area,
      uom_type: g.uom_type,
      target: g.target,
      weightage: g.weightage,
      deadline: g.deadline,
      progress_pct: computeProgress(g),
      status: g.status,
      approval_status: g.approval_status,
      locked: g.locked,
      mc: g.manager_comments || "",
    });
  }
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="goals.xlsx"');
  await wb.xlsx.write(res);
  res.end();
});

exports.auditCsv = asyncHandler(async (_req, res) => {
  const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(2000).lean();
  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))];
  const users = await User.find({ id: { $in: userIds } }).select("id name email").lean();
  const umap = Object.fromEntries(users.map((u) => [u.id, u]));
  const rows = logs.map((l) => ({
    timestamp: l.timestamp?.toISOString?.() || l.timestamp,
    user_name: umap[l.user_id]?.name || "Unknown",
    user_email: umap[l.user_id]?.email || "",
    action: l.action,
    target_type: l.target_type,
    target_id: l.target_id,
    old_value: typeof l.old_value === "object" ? JSON.stringify(l.old_value) : (l.old_value ?? ""),
    new_value: typeof l.new_value === "object" ? JSON.stringify(l.new_value) : (l.new_value ?? ""),
  }));
  const parser = new Parser({ fields: ["timestamp", "user_name", "user_email", "action", "target_type", "target_id", "old_value", "new_value"] });
  const csv = rows.length ? parser.parse(rows) : "timestamp\n";
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="audit.csv"');
  res.send(csv);
});
