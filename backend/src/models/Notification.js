const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  delivered_via: {
    type: String,
    enum: ["smtp", "log", "failed"],
    default: "log"
  }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model("Notification", notificationSchema);
