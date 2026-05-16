const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = nodemailer.createTransport({ jsonTransport: true });
    transporter.__mock = true;
  } else {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

async function sendEmail({ to_user, to_email, type, subject, body }) {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || "GoalGrid <noreply@goalgrid.local>";
  let delivered_via = "log";
  try {
    if (!t.__mock && to_email) {
      await t.sendMail({ from, to: to_email, subject, text: body });
      delivered_via = "smtp";
    } else if (to_email) {
      const info = await t.sendMail({ from, to: to_email, subject, text: body });
      console.log(`[mail:mock] → ${to_email} | ${subject}`);
      delivered_via = info?.envelope ? "log" : "log";
    }
  } catch (err) {
    console.error("[goalgrid] email failed:", err.message);
    delivered_via = "failed";
  }
  return Notification.create({
    user_id: to_user,
    type,
    subject,
    body,
    delivered_via,
  });
}

async function notifyGoalSubmitted({ employee, manager, goal }) {
  if (!manager) return;
  await sendEmail({
    to_user: manager.id,
    to_email: manager.email,
    type: "goal_submitted",
    subject: `Goal submitted for approval — ${goal.title}`,
    body: `${employee.name} submitted "${goal.title}" (${goal.weightage}% weight, target ${goal.target}). Review it in your Approvals queue.`,
  });
}

async function notifyGoalApproved({ employee, goal }) {
  await sendEmail({
    to_user: employee.id,
    to_email: employee.email,
    type: "goal_approved",
    subject: `Goal approved — ${goal.title}`,
    body: `Your goal "${goal.title}" was approved and is now locked. Start logging quarterly check-ins.`,
  });
}

async function notifyGoalRejected({ employee, goal, comments }) {
  await sendEmail({
    to_user: employee.id,
    to_email: employee.email,
    type: "goal_rejected",
    subject: `Goal rejected — ${goal.title}`,
    body: `Your goal "${goal.title}" was rejected.\n\nManager comments: ${comments || "(none)"}`,
  });
}

async function notifyQuarterlyReminder({ user, quarter }) {
  await sendEmail({
    to_user: user.id,
    to_email: user.email,
    type: "quarterly_reminder",
    subject: `${quarter} check-in reminder`,
    body: `Reminder: your ${quarter} check-in is due. Log planned vs achieved progress on each of your active goals.`,
  });
}

module.exports = {
  sendEmail,
  notifyGoalSubmitted,
  notifyGoalApproved,
  notifyGoalRejected,
  notifyQuarterlyReminder,
};
