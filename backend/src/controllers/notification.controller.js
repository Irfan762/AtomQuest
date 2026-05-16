const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

exports.list = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user_id: req.user.id })
    .sort({ created_at: -1 })
    .limit(100)
    .lean();
  res.json(items.map((n) => ({ ...n, _id: undefined })));
});

exports.markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ id: req.params.id, user_id: req.user.id }, { $set: { read: true } });
  res.json({ ok: true });
});
