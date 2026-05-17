const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const scenarioSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  manager_id: {
    type: String,
    required: true,
    index: true
  },
  department: {
    type: String,
    default: ""
  },
  sliders: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  dept_impact: {
    type: Number,
    default: 0
  },
  org_impact: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model("Scenario", scenarioSchema);
