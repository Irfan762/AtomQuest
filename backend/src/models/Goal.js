const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const quarterlyUpdateSchema = new mongoose.Schema({
  quarter: {
    type: String,
    enum: ["Q1", "Q2", "Q3", "Q4"],
    required: true
  },
  planned: {
    type: Number,
    default: 0
  },
  achieved: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Not Started", "On Track", "At Risk", "Completed"],
    default: "Not Started"
  },
  comments: {
    type: String,
    default: ""
  },
  manager_comments: {
    type: String,
    default: ""
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const goalSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
    unique: true
  },
  employee_id: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  thrust_area: {
    type: String,
    required: true
  },
  uom_type: {
    type: String,
    enum: ["numeric", "percentage", "timeline", "zero"],
    default: "numeric"
  },
  target: {
    type: Number,
    required: true
  },
  weightage: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Not Started", "On Track", "At Risk", "Completed"],
    default: "Not Started"
  },
  approval_status: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected"],
    default: "draft"
  },
  locked: {
    type: Boolean,
    default: false
  },
  manager_comments: {
    type: String,
    default: ""
  },
  shared_goal_id: {
    type: String,
    default: null
  },
  quarterly_updates: [quarterlyUpdateSchema]
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model("Goal", goalSchema);
