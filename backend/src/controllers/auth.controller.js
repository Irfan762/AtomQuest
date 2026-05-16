const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { httpError } = require("../utils/helpers");
const {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} = require("../middleware/auth");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "employee", manager_id, department } = req.body || {};
  if (!name || !email || !password) throw httpError(400, "name, email and password are required");
  if (password.length < 6) throw httpError(400, "Password must be at least 6 chars");
  const emailLc = String(email).toLowerCase();
  const exists = await User.findOne({ email: emailLc });
  if (exists) throw httpError(400, "Email already registered");
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: emailLc,
    password_hash,
    role,
    manager_id: manager_id || null,
    department: department || null,
  });
  const access = createAccessToken(user);
  const refresh = createRefreshToken(user);
  setAuthCookies(res, access, refresh);
  res.json({ user: user.toPublic(), access_token: access });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw httpError(400, "email and password are required");
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || user.is_deleted) throw httpError(401, "Invalid email or password");
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw httpError(401, "Invalid email or password");
  const access = createAccessToken(user);
  const refresh = createRefreshToken(user);
  setAuthCookies(res, access, refresh);
  res.json({ user: user.toPublic(), access_token: access });
});

exports.logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
});

exports.me = asyncHandler(async (req, res) => {
  const u = req.user;
  res.json(u.toPublic());
});
