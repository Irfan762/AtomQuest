const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { logAudit } = require("../services/audit.service");
const { httpError } = require("../utils/helpers");

function publicUser(u) {
  return {
    id: u.id, name: u.name, email: u.email, role: u.role,
    manager_id: u.manager_id, department: u.department, created_at: u.created_at,
  };
}

exports.list = asyncHandler(async (req, res) => {
  const me = req.user;
  let users;
  if (me.role === "admin") {
    users = await User.find({}).lean();
  } else if (me.role === "manager") {
    users = await User.find({ $or: [{ manager_id: me.id }, { id: me.id }] }).lean();
  } else {
    users = [me];
  }
  res.json(users.map(publicUser));
});

exports.managers = asyncHandler(async (_req, res) => {
  const list = await User.find({ role: { $in: ["manager", "admin"] } }).lean();
  res.json(list.map(publicUser));
});

exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, role = "employee", manager_id, department } = req.body || {};
  if (!name || !email || !password) throw httpError(400, "name, email and password are required");
  const emailLc = String(email).toLowerCase();
  if (await User.findOne({ email: emailLc })) throw httpError(400, "Email already exists");
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name, email: emailLc, password_hash, role,
    manager_id: manager_id || null, department: department || null,
  });
  await logAudit({
    user_id: req.user.id, action: "create_user", target_type: "user", target_id: user.id,
    new_value: { email: emailLc, role },
  });
  res.json({ id: user.id, email: emailLc, role });
});

exports.remove = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const target = await User.findOne({ id: user_id });
  if (!target) throw httpError(404, "User not found");
  if (target.id === req.user.id) throw httpError(400, "Cannot delete yourself");
  await User.deleteOne({ id: user_id });
  await logAudit({
    user_id: req.user.id, action: "delete_user", target_type: "user", target_id: user_id,
    old_value: publicUser(target),
  });
  res.json({ ok: true });
});
