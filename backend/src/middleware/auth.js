const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { httpError } = require("../utils/helpers");

const createAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const createRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600000 // 1h
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 3600000 // 7d
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
};

const authRequired = asyncHandler(async (req, res, next) => {
  let token = req.cookies.access_token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw httpError(401, "Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findOne({ id: decoded.id });
    if (!req.user) throw httpError(401, "User not found");
    next();
  } catch (error) {
    throw httpError(401, "Not authorized, token failed");
  }
});

module.exports = {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  authRequired
};
