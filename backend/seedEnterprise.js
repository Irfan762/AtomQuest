const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Goal = require("./src/models/Goal");
const AuditLog = require("./src/models/AuditLog");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB for enterprise seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Goal.deleteMany({});
    await AuditLog.deleteMany({});

    const passwordHash = await bcrypt.hash("Password@123", 10);

    // Create Admin
    const admin = await User.create({
      id: "admin-001",
      name: "John CEO",
      email: "admin@company.com",
      password_hash: passwordHash,
      role: "admin",
      department: "Leadership"
    });

    // Create Managers
    const mgrs = [
      { id: "mgr-001", name: "Sarah Sales", email: "sarah@company.com", dept: "Sales" },
      { id: "mgr-002", name: "Dave Dev", email: "dave@company.com", dept: "Engineering" },
      { id: "mgr-003", name: "Helen HR", email: "helen@company.com", dept: "HR" }
    ];

    const managers = [];
    for (const m of mgrs) {
      const user = await User.create({
        id: m.id,
        name: m.name,
        email: m.email,
        password_hash: passwordHash,
        role: "manager",
        department: m.dept,
        manager_id: "admin-001"
      });
      managers.push(user);
    }

    // Create Employees
    const emps = [
      { id: "emp-001", name: "Alice Adams", email: "alice@company.com", dept: "Sales", mgr: "mgr-001" },
      { id: "emp-002", name: "Bob Brown", email: "bob@company.com", dept: "Sales", mgr: "mgr-001" },
      { id: "emp-003", name: "Charlie Case", email: "charlie@company.com", dept: "Engineering", mgr: "mgr-002" },
      { id: "emp-004", name: "Diana Door", email: "diana@company.com", dept: "Engineering", mgr: "mgr-002" },
      { id: "emp-005", name: "Eve Evans", email: "eve@company.com", dept: "HR", mgr: "mgr-003" },
      { id: "emp-006", name: "Frank Fox", email: "frank@company.com", dept: "Marketing", mgr: "mgr-001" },
      { id: "emp-007", name: "Grace Gills", email: "grace@company.com", dept: "Marketing", mgr: "mgr-001" }
    ];

    const employees = [];
    for (const e of emps) {
      const user = await User.create({
        id: e.id,
        name: e.name,
        email: e.email,
        password_hash: passwordHash,
        role: "employee",
        department: e.dept,
        manager_id: e.mgr
      });
      employees.push(user);
    }

    console.log("Users created. Seeding goals...");

    const goalsData = [
      { 
        id: "goal-1", employee_id: "emp-001", title: "Increase Enterprise Revenue", 
        target: 1000000, weightage: 40, status: "On Track", approval_status: "approved", locked: true,
        uom_type: "numeric", progress_direction: "max",
        quarterly_updates: [
          { quarter: "Q1", planned: 250000, achieved: 280000, comment: "Exceeded Q1 target due to high-value closing." }
        ]
      },
      { 
        id: "goal-2", employee_id: "emp-003", title: "Core Engine Migration", 
        target: 100, weightage: 50, status: "At Risk", approval_status: "approved", locked: true,
        uom_type: "percentage", progress_direction: "max",
        quarterly_updates: [
          { quarter: "Q1", planned: 30, achieved: 15, comment: "Technical hurdles with legacy code." }
        ]
      },
      { 
        id: "goal-3", employee_id: "emp-005", title: "Internal Training Program", 
        target: 10, weightage: 30, status: "Completed", approval_status: "approved", locked: true,
        uom_type: "numeric", progress_direction: "max",
        quarterly_updates: [
          { quarter: "Q1", planned: 3, achieved: 4, comment: "Early rollout success." }
        ]
      }
    ];

    for (const g of goalsData) {
      await Goal.create({
        ...g,
        description: "Enterprise seeded objective for demo purposes.",
        thrust_area: "Strategic Growth",
        deadline: new Date("2026-12-31")
      });
    }

    console.log("Enterprise seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
