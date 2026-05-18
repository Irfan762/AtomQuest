const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function upsertSeedUser({ name, email, password, role, manager_id = null, department = null }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const same = await bcrypt.compare(password, existing.password_hash);
    if (!same) {
      existing.password_hash = await bcrypt.hash(password, 10);
      await existing.save();
    }
    return existing;
  }
  const password_hash = await bcrypt.hash(password, 10);
  return User.create({ name, email, password_hash, role, manager_id, department });
}

async function seedDemoUsers() {
  const admin = await upsertSeedUser({
    name: "Admin User",
    email: process.env.ADMIN_EMAIL || "admin@company.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    role: "admin",
    department: "Operations",
  });
  const manager = await upsertSeedUser({
    name: "Manager User",
    email: process.env.MANAGER_EMAIL || "manager@company.com",
    password: process.env.MANAGER_PASSWORD || "Manager@123",
    role: "manager",
    department: "Engineering",
  });
  await upsertSeedUser({
    name: "Alice Employee",
    email: process.env.EMP1_EMAIL || "alice@company.com",
    password: process.env.EMP1_PASSWORD || "Alice@123",
    role: "employee",
    manager_id: manager.id,
    department: "Engineering",
  });
  await upsertSeedUser({
    name: "Bob Employee",
    email: process.env.EMP2_EMAIL || "bob@company.com",
    password: process.env.EMP2_PASSWORD || "Bob@123",
    role: "employee",
    manager_id: manager.id,
    department: "Engineering",
  });
  console.log(`[goalgrid] Seeded demo users (admin=${admin.id})`);
}

module.exports = seedDemoUsers;
