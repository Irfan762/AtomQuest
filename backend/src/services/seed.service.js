const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Goal = require("../models/Goal");
const Conflict = require("../models/Conflict");
const Scenario = require("../models/Scenario");
const AuditLog = require("../models/AuditLog");

async function upsertSeedUser({ id, name, email, password, role, manager_id = null, department = null }) {
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
  return User.create({ id, name, email, password_hash, role, manager_id, department });
}

async function seedDemoUsers() {
  const defaultPassword = "Password@123";

  // 1. Create Leadership & Managers
  const admin = await upsertSeedUser({
    id: "admin-001",
    name: "John CEO",
    email: (process.env.ADMIN_EMAIL || "admin@company.com").trim(),
    password: (process.env.ADMIN_PASSWORD || defaultPassword).trim(),
    role: "admin",
    department: "Leadership",
  });

  const sarah = await upsertSeedUser({
    id: "mgr-001",
    name: "Sarah Sales",
    email: (process.env.MANAGER_EMAIL || "manager@company.com").trim(),
    password: (process.env.MANAGER_PASSWORD || defaultPassword).trim(),
    role: "manager",
    department: "Sales",
    manager_id: "admin-001"
  });

  const dave = await upsertSeedUser({
    id: "mgr-002",
    name: "Dave Dev",
    email: "dave@company.com",
    password: defaultPassword,
    role: "manager",
    department: "Engineering",
    manager_id: "admin-001"
  });

  const helen = await upsertSeedUser({
    id: "mgr-003",
    name: "Helen HR",
    email: "helen@company.com",
    password: defaultPassword,
    role: "manager",
    department: "HR",
    manager_id: "admin-001"
  });

  // 2. Create Employees
  const alice = await upsertSeedUser({
    id: "emp-001",
    name: "Alice Adams",
    email: (process.env.EMP1_EMAIL || "alice@company.com").trim(),
    password: (process.env.EMP1_PASSWORD || defaultPassword).trim(),
    role: "employee",
    manager_id: "mgr-001",
    department: "Sales",
  });

  const bob = await upsertSeedUser({
    id: "emp-002",
    name: "Bob Brown",
    email: (process.env.EMP2_EMAIL || "bob@company.com").trim(),
    password: (process.env.EMP2_PASSWORD || defaultPassword).trim(),
    role: "employee",
    manager_id: "mgr-001",
    department: "Sales",
  });

  const charlie = await upsertSeedUser({
    id: "emp-003",
    name: "Charlie Case",
    email: "charlie@company.com",
    password: defaultPassword,
    role: "employee",
    manager_id: "mgr-002",
    department: "Engineering",
  });

  const diana = await upsertSeedUser({
    id: "emp-004",
    name: "Diana Door",
    email: "diana@company.com",
    password: defaultPassword,
    role: "employee",
    manager_id: "mgr-002",
    department: "Engineering",
  });

  const eve = await upsertSeedUser({
    id: "emp-005",
    name: "Eve Evans",
    email: "eve@company.com",
    password: defaultPassword,
    role: "employee",
    manager_id: "mgr-003",
    department: "HR",
  });

  console.log(`[goalgrid] Seeded all 9 hierarchical corporate users (admin=${admin.id})`);

  // 3. Seed Cascading Goals, Conflicts & Simulator Snapshots if clean
  const goalCount = await Goal.countDocuments();
  if (goalCount === 0) {
    console.log("[goalgrid] Goals collection empty. Seeding hierarchical cascading goals...");
    
    // CEO strategic target (Level 1)
    const companyGoal = await Goal.create({
      id: "admin-goal-1",
      employee_id: "admin-001",
      title: "Company Strategy: Scale Annual Recurring Revenue to $10M",
      description: "Admin objective for global ARR scaling through high ticket enterprise subscriptions.",
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

    // Sales Manager target aligned to CEO strategic target (Level 2)
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

    // Alice target aligned to Sales Strategy (Level 3)
    await Goal.create({
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

    // Charlie Serverless Migration (Level 3, struggling)
    await Goal.create({
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

    // Diana Testing Suites (Level 3, blocked)
    await Goal.create({
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

    // Eve HR headcount cost cut
    await Goal.create({
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

    // Dave Dev Backend Recruiting (conflicts with Eve)
    await Goal.create({
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

    console.log("[goalgrid] Seeding AI conflict matrix...");
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

    console.log("[goalgrid] Seeding Scenario snapshots...");
    await Scenario.create({
      name: "Q3 Best Case Optimization",
      description: "Simulating active 15% goal increase across all sales pipelines.",
      manager_id: "mgr-001",
      department: "Sales",
      sliders: [
        { goal_id: "emp-goal-1", progress: 75, weightage: 60 }
      ],
      dept_impact: 68,
      org_impact: 62
    });

    console.log("[goalgrid] Seeding initial Audit logs...");
    await AuditLog.create({
      action: "database_seed",
      actor_id: "admin-001",
      actor_name: "John CEO",
      target_id: "all",
      details: "Populated production-grade corporate hierarchy goals and wellness metrics.",
      timestamp: new Date()
    });

    console.log("[goalgrid] Full enterprise seed populated successfully!");
  }
}

module.exports = seedDemoUsers;
