const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
    unique: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["employee", "manager", "admin"],
    default: "employee"
  },
  manager_id: {
    type: String,
    default: null
  },
  department: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

userSchema.methods.toPublic = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    manager_id: this.manager_id,
    department: this.department,
    created_at: this.created_at
  };
};

module.exports = mongoose.model("User", userSchema);
