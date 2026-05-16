const asyncHandler = require("express-async-handler");
const Goal = require("../models/Goal");
const User = require("../models/User");
const { computeProgress } = require("../services/progress.service");

function predictRisk(goal) {
  const progress = computeProgress(goal);
  const updates = goal.quarterly_updates || [];
  const deadline = new Date(goal.deadline);
  const now = new Date();
  let riskScore = 0;
  const daysLeft = (deadline - now) / (1000 * 60 * 60 * 24);
  if (daysLeft < 30 && progress < 50) riskScore += 40;
  if (daysLeft < 90 && progress < 20) riskScore += 20;
  const month = now.getMonth();
  const currentQ = month < 3 ? 1 : month < 6 ? 2 : month < 9 ? 3 : 4;
  if (updates.length < currentQ - 1) riskScore += 30;
  return Math.min(riskScore, 100);
}

exports.dashboard = asyncHandler(async (req, res) => {
  const me = req.user;
  let goalQuery;
  if (me.role === "admin") {
    goalQuery = {};
  } else if (me.role === "manager") {
    const team = await User.find({ manager_id: me.id }).select("id").lean();
    const ids = [...team.map((t) => t.id), me.id];
    goalQuery = { employee_id: { $in: ids } };
  } else {
    goalQuery = { employee_id: me.id };
  }
  const goals = await Goal.find(goalQuery).lean();
  const total = goals.length;
  const by = (s) => goals.filter((g) => g.status === s).length;
  const completed = by("Completed");
  const on_track = by("On Track");
  const at_risk = by("At Risk");
  const not_started = by("Not Started");
  const pending_approval = goals.filter((g) => g.approval_status === "submitted").length;

  // Quarterly trends
  const qmap = { Q1: [], Q2: [], Q3: [], Q4: [] };
  for (const g of goals) {
    for (const q of g.quarterly_updates || []) {
      if (qmap[q.quarter]) qmap[q.quarter].push({ planned: Number(q.planned || 0), achieved: Number(q.achieved || 0) });
    }
  }
  const quarterly_trends = ["Q1", "Q2", "Q3", "Q4"].map((q) => ({
    quarter: q,
    planned: qmap[q].reduce((s, x) => s + x.planned, 0),
    achieved: qmap[q].reduce((s, x) => s + x.achieved, 0),
  }));

  const status_distribution = [
    { name: "Completed", value: completed },
    { name: "On Track", value: on_track },
    { name: "At Risk", value: at_risk },
    { name: "Not Started", value: not_started },
  ];

  // Team performance (manager/admin only)
  let team_performance = [];
  if (me.role !== "employee") {
    const empIds = [...new Set(goals.map((g) => g.employee_id))];
    const us = await User.find({ id: { $in: empIds } }).select("id name department").lean();
    const umap = Object.fromEntries(us.map((u) => [u.id, u]));
    const perEmp = {};
    for (const g of goals) {
      (perEmp[g.employee_id] = perEmp[g.employee_id] || []).push(computeProgress(g));
    }
    team_performance = Object.entries(perEmp).map(([eid, plist]) => ({
      employee_id: eid,
      name: umap[eid]?.name || "Unknown",
      department: umap[eid]?.department || "",
      avg_progress: plist.length ? Math.round((plist.reduce((s, p) => s + p, 0) / plist.length) * 100) / 100 : 0,
      goal_count: plist.length,
    }));
  }

  // Department analytics (admin only)
  let department_analytics = [];
  if (me.role === "admin") {
    const allUsers = await User.find({}).select("id department").lean();
    const umap = Object.fromEntries(allUsers.map((u) => [u.id, u]));
    const deptMap = {};
    for (const g of goals) {
      const dept = umap[g.employee_id]?.department || "Unassigned";
      (deptMap[dept] = deptMap[dept] || []).push(computeProgress(g));
    }
    department_analytics = Object.entries(deptMap).map(([d, v]) => ({
      department: d,
      avg_progress: v.length ? Math.round((v.reduce((s, p) => s + p, 0) / v.length) * 100) / 100 : 0,
      goal_count: v.length,
    }));
  }

  const completion_rate = total ? Math.round((completed / total) * 10000) / 100 : 0;

  const risk_analysis = goals.map(g => ({
    id: g.id,
    title: g.title,
    score: predictRisk(g),
    indicator: predictRisk(g) > 60 ? "Red" : predictRisk(g) > 30 ? "Yellow" : "Green"
  }));

  res.json({
    summary: { total_goals: total, completed, on_track, at_risk, not_started, pending_approval, completion_rate },
    quarterly_trends,
    status_distribution,
    team_performance,
    department_analytics,
    risk_analysis
  });
});
