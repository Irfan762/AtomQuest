const cron = require("node-cron");
const Goal = require("../models/Goal");
const User = require("../models/User");
const { 
  notifyQuarterlyReminder, 
  sendEmail 
} = require("./email.service");

function initScheduler() {
  // Every Monday at 9 AM: Check for pending submissions and check-ins
  cron.schedule("0 9 * * 1", async () => {
    console.log("[goalgrid] Running weekly reminder task...");
    await remindPendingSubmissions();
    await remindPendingCheckins();
  });

  // Every Tuesday at 9 AM: Check for pending manager approvals
  cron.schedule("0 9 * * 2", async () => {
    console.log("[goalgrid] Running weekly approval reminder task...");
    await remindPendingApprovals();
  });

  console.log("[goalgrid] Scheduler initialized (Weekly Reminders)");
}

async function remindPendingSubmissions() {
  // Find users who have goals in 'draft' status
  const draftGoals = await Goal.find({ approval_status: "draft" }).select("employee_id").lean();
  const empIds = [...new Set(draftGoals.map(g => g.employee_id))];
  const users = await User.find({ id: { $in: empIds } }).lean();

  for (const user of users) {
    await sendEmail({
      to_user: user.id,
      to_email: user.email,
      type: "submission_reminder",
      subject: "Action Required: Goal Submission Pending",
      body: `Hi ${user.name},\n\nYou have goals in 'Draft' status that haven't been submitted for approval yet. Please ensure your total weightage is 100% and submit them for review.`
    });
  }
}

async function remindPendingApprovals() {
  // Find goals in 'submitted' status and group by manager
  const pendingGoals = await Goal.find({ approval_status: "submitted" }).lean();
  const empIds = pendingGoals.map(g => g.employee_id);
  const emps = await User.find({ id: { $in: empIds } }).lean();
  const empMap = Object.fromEntries(emps.map(e => [e.id, e]));

  const managerReminders = {}; // manager_id -> count
  for (const g of pendingGoals) {
    const mgrId = empMap[g.employee_id]?.manager_id;
    if (mgrId) {
      managerReminders[mgrId] = (managerReminders[mgrId] || 0) + 1;
    }
  }

  for (const [mgrId, count] of Object.entries(managerReminders)) {
    const manager = await User.findOne({ id: mgrId }).lean();
    if (manager) {
      await sendEmail({
        to_user: manager.id,
        to_email: manager.email,
        type: "approval_reminder",
        subject: "Action Required: Pending Goal Approvals",
        body: `Hi ${manager.name},\n\nYou have ${count} goal(s) waiting for your approval in the GoalGrid portal. Please review them at your earliest convenience.`
      });
    }
  }
}

async function remindPendingCheckins() {
  // Determine current quarter
  const month = new Date().getMonth();
  const quarter = month < 3 ? "Q1" : month < 6 ? "Q2" : month < 9 ? "Q3" : "Q4";

  // Find all approved goals
  const approvedGoals = await Goal.find({ approval_status: "approved" }).lean();
  const empIds = [...new Set(approvedGoals.map(g => g.employee_id))];
  const users = await User.find({ id: { $in: empIds } }).lean();

  for (const user of users) {
    await notifyQuarterlyReminder({ user, quarter });
  }
}

module.exports = { initScheduler };
