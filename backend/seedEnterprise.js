const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Goal = require("./src/models/Goal");
const AuditLog = require("./src/models/AuditLog");
const Conflict = require("./src/models/Conflict");
const Scenario = require("./src/models/Scenario");
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
    await Conflict.deleteMany({});
    await Scenario.deleteMany({});

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
      { id: "mgr-001", name: "Sarah Sales", email: "manager@company.com", dept: "Sales" }, // manager@company.com
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
      { id: "emp-005", name: "Eve Evans", email: "eve@company.com", dept: "HR", mgr: "mgr-003" }
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

    console.log("Users seeded successfully. Seeding hierarchical cascading goals...");

    // 1. Strategic Cascade Hierarchy
    // Admin Strategy goal (Top of Cascade)
    const companyGoal = await Goal.create({
      id: "admin-goal-1",
      employee_id: "admin-001",
      title: "Company Strategy: Scale Annual Recurring Revenue to $10M",
      description: "Admin objective for global ARR scaling through high ticket subscriptions.",
      thrust_area: "Strategic Growth",
      uom_type: "numeric",
      target: 10000000,
      weightage: 100,
      status: "On Track",
      approval_status: "approved",
      locked: true,
      startDate: new Date("2026-01-01"),
      deadline: new Date("2026-12-31"),
      progress: 60
    });

    // Department/Manager goal aligned to Admin strategy (Middle of Cascade)
    const departmentGoal = await Goal.create({
      id: "mgr-goal-1",
      employee_id: "mgr-001",
      title: "Sales Strategy: Expand Department Enterprise Pipeline by 45%",
      description: "Department OKR linked to the CEO Annual recurring revenue target.",
      thrust_area: "Sales Strategy",
      uom_type: "percentage",
      target: 45,
      weightage: 50,
      status: "On Track",
      approval_status: "approved",
      locked: true,
      parentGoalId: "admin-goal-1",
      startDate: new Date("2026-02-15"),
      deadline: new Date("2026-10-31"),
      progress: 40
    });

    // Individual goal aligned to Department Strategy (Bottom of Cascade)
    const employeeGoal1 = await Goal.create({
      id: "emp-goal-1",
      employee_id: "emp-001",
      title: "Alice OKR: Acquire 5 New High-Value Enterprise Accounts",
      description: "Individual sales outreach targets supporting departmental enterprise pipelines.",
      thrust_area: "Customer Growth",
      uom_type: "numeric",
      target: 5,
      weightage: 50,
      status: "On Track",
      approval_status: "approved",
      locked: true,
      parentGoalId: "mgr-goal-1",
      startDate: new Date("2026-03-01"),
      deadline: new Date("2026-09-30"),
      progress: 60,
      quarterly_updates: [
        {
          quarter: "Q1",
          planned: 2,
          achieved: 3,
          status: "On Track",
          mood: "confident",
          comments: "Pipeline is very active. Feeling confident about the contract sizes!"
        }
      ]
    });

    // 2. Wellbeing Pulse Checkin demo targets
    const employeeGoal2 = await Goal.create({
      id: "emp-goal-2",
      employee_id: "emp-003",
      title: "Charlie OKR: Migrate AWS Billing Stack to Serverless Architecture",
      description: "Improve performance and decrease running costs by migrating microservices.",
      thrust_area: "Infrastructure Optimization",
      uom_type: "percentage",
      target: 100,
      weightage: 40,
      status: "At Risk",
      approval_status: "approved",
      locked: true,
      startDate: new Date("2026-01-15"),
      deadline: new Date("2026-08-31"),
      progress: 25,
      quarterly_updates: [
        {
          quarter: "Q1",
          planned: 40,
          achieved: 25,
          status: "At Risk",
          mood: "struggling",
          comments: "Running into multiple Docker cold-start delays. Stressed about migration timeline."
        }
      ]
    });

    const employeeGoal3 = await Goal.create({
      id: "emp-goal-3",
      employee_id: "emp-004",
      title: "Diana OKR: Deploy Automated API Testing Suites",
      description: "Build robust integrations across pipelines with continuous integration checks.",
      thrust_area: "Engineering Quality",
      uom_type: "numeric",
      target: 80,
      weightage: 30,
      status: "At Risk",
      approval_status: "approved",
      locked: true,
      startDate: new Date("2026-03-01"),
      deadline: new Date("2026-11-30"),
      progress: 10,
      quarterly_updates: [
        {
          quarter: "Q1",
          planned: 30,
          achieved: 10,
          status: "At Risk",
          mood: "blocked",
          comments: "Complete database migrations are halting API testing loops. Completely blocked."
        }
      ]
    });

    // 3. Departmental Conflicting Objectives
    const employeeGoal4 = await Goal.create({
      id: "emp-goal-4",
      employee_id: "emp-005",
      title: "Eve OKR: Reduce Headcount Costs by 12% across Tech divisions",
      description: "Mandated corporate cost structures to consolidate global headcount expenses.",
      thrust_area: "Operational Efficiency",
      uom_type: "percentage",
      target: 12,
      weightage: 50,
      status: "On Track",
      approval_status: "approved",
      locked: true,
      startDate: new Date("2026-02-01"),
      deadline: new Date("2026-12-15"),
      progress: 30
    });

    const managerGoal2 = await Goal.create({
      id: "mgr-goal-2",
      employee_id: "mgr-002",
      title: "Dave OKR: Aggressively Recruit and Hire 15 Senior Backend Engineers",
      description: "Departmental mandate to hire engineering staff for product scale requirements.",
      thrust_area: "Talent Acquisition",
      uom_type: "numeric",
      target: 15,
      weightage: 40,
      status: "On Track",
      approval_status: "approved",
      locked: true,
      startDate: new Date("2026-01-10"),
      deadline: new Date("2026-12-31"),
      progress: 20
    });

    console.log("Goals populated. Seeding AI conflict resolutions...");

    // Seed conflict matrix
    await Conflict.create({
      goal1_id: "emp-goal-4",
      goal2_id: "mgr-goal-2",
      goal1_title: "Eve OKR: Reduce Headcount Costs by 12% across Tech divisions",
      goal2_title: "Dave OKR: Aggressively Recruit and Hire 15 Senior Backend Engineers",
      conflict_type: "Resource & Policy Constraint",
      severity: "high",
      explanation: "AI detected a severe structural policy conflict. Recruiting 15 engineers directly opposes the organizational cost optimization mandate to decrease global tech headcount by 12%.",
      resolved: false
    });

    console.log("Seeding Scenario Simulator Snapshots...");

    // Seed simulation snapshots
    await Scenario.create({
      name: "Q3 Best Case Optimization",
      description: "Simulating active 15% goal increase across all marketing pipelines.",
      manager_id: "mgr-001",
      department: "Sales",
      sliders: [
        { goal_id: "emp-goal-1", progress: 75, weightage: 60 }
      ],
      dept_impact: 68,
      org_impact: 62
    });

    console.log("Enterprise database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Enterprise seeding failed:", err);
    process.exit(1);
  }
}

seed();
