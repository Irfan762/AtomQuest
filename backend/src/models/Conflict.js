const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const conflictSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
    unique: true
  },
  goal1_id: {
    type: String,
    required: true,
    index: true
  },
  goal2_id: {
    type: String,
    required: true,
    index: true
  },
  goal1_title: {
    type: String,
    default: ""
  },
  goal2_title: {
    type: String,
    default: ""
  },
  conflict_type: {
    type: String,
    default: "Resource Competition"
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },
  explanation: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolved_by: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model("Conflict", conflictSchema);
