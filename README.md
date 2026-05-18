# GoalGrid — Performance Management System

GoalGrid is a comprehensive MERN stack platform designed for corporate performance tracking. It enables employees to define goals, managers to approve them, and teams to monitor quarterly progress with precision formulas.

## 🚀 Key Features

- **AI SMART Goal Assistant**: Real-time analysis and optimization of goals into SMART criteria with scoring.
- **Executive Insight Dashboard**: Organization-wide heatmap, risk prediction, and departmental intensity charts.
- **AI Performance Reviews**: Automated quarterly performance summaries with strength/weakness identification.
- **AI Chat Assistant**: Persistent chatbot for querying performance data and platform navigation.
- **Goal Risk Prediction**: Predictive engine to identify objectives at risk of failure based on historical data.
- **Gamification Layer**: Streaks, achievement badges, and quarterly champions leaderboard.
- **Goal Management**: Strict validation (Max 8 goals, 100% total weightage, 10% min per goal).
- **Intelligent Progress Formulas**: Support for Maximize, Minimize, Timeline, and Zero-based UoM types.
- **Shared KPIs**: Managers can push goals to multiple employees and sync achievement updates in real-time.
- **Quarterly Check-ins**: Planned vs Achieved tracking with dedicated manager feedback loops.
- **Audit Governance**: Immutable logs of all system actions for compliance.
- **Reporting**: One-click Export to CSV/XLSX for performance analysis.
- **Automated Reminders**: Node-cron powered notifications for pending submissions, approvals, and check-ins.
- **Multi-Role Authentication**: Secure JWT-based login for Employees, Managers, and Admins.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (v4), Lucide Icons, Recharts, Sonner.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Services**: Nodemailer (Email), Node-cron (Scheduling), ExcelJS (Reporting).

## 📋 Hackathon Requirements Implemented

- [x] JWT Authentication & Role-based Access
- [x] Goal Creation with Thrust Areas & Weightage Rules
- [x] Manager Approval/Rejection Workflow
- [x] Quarterly Check-ins (Planned vs Actual)
- [x] Shared Goal Assignment & Achievement Sync
- [x] Automated Reminders (Submission/Approval/Check-in)
- [x] Admin Dashboard & Goal Unlocking
- [x] Audit Logs & Data Export (CSV/XLSX)
- [x] Responsive, Premium UI/UX

## 💻 Installation & Setup

### Backend

1. `cd backend`
2. `npm install`
3. Create `.env` based on `.env.example`.
4. `npm start`

### Frontend

1. `cd frontend`
2. `npm install`
3. Create `.env` based on `.env.example`.
4. `npm run dev`

## 🧪 Active Enterprise Test Credentials

The database has been seeded with a production-grade enterprise organizational hierarchy. Use the floating **Hackathon Demo Panel** in the bottom-left corner to switch perspectives with one click, or log in manually using:

| Role          | Email                 | Password       | Department |
| :------------ | :-------------------- | :------------- | :--------- |
| **Admin CEO** | `admin@company.com`   | `Password@123` | Leadership |
| **Manager**   | `manager@company.com` | `Password@123` | Sales      |
| **Employee**  | `alice@company.com`   | `Password@123` | Sales      |

---

## 🌟 5 Advanced Enterprise Differentiators (Hackathon Winners)

GoalGrid has been upgraded with five unique, high-fidelity strategic features designed to satisfy enterprise governance needs:

### 1. Goal Alignment Cascade Tree (`/alignment-tree`)

- **What it is**: An interactive, animated parent-child tree mapping the flow of strategic objectives from the **CEO** -> **Managers** -> **Employees**.
- **Special Integrations**:
  - Automatically alerts managers of **Orphaned Goals** (employee objectives lacking a parent/department linkage).
  - Computes a global **Strategy Alignment Score** representing corporate OKR compliance.

### 2. Employee Wellbeing Pulse Tracker (`/wellbeing`)

- **What it is**: A mood tracker integrated directly into the quarterly check-in submission. Employees log their emotional state: Confident (😊), Challenged (😐), Struggling (😰), or Blocked (🚨).
- **Special Integrations**:
  - Automatically dispatches **instant email and notification alerts** to the employee's manager upon logging distressed states.
  - Renders a department-by-department **Team Wellbeing Heatmap** and global stress indicators for leadership analysis.

### 3. AI Goal Conflict Detector (`/conflicts`)

- **What it is**: A semantic scanner powered by the **Google Gemini API** (with high-fidelity rule-based keyword falls) that detects cost/headcount/resource conflicts across departments (e.g., hiring backend staff vs tech budget reductions).
- **Special Integrations**:
  - Triggers automatically upon goal approvals.
  - Includes an **Admin Conflict Resolution Center** for marking conflicts resolved.
  - Displays real-time warning indicators on individual goal cards and the main executive dashboard.

### 4. Goal Timeline Gantt View (`/timeline`)

- **What it is**: A horizontal, monthly bar chart plotting goal schedules and operational durations from `startDate` to `deadline`.
- **Special Integrations**:
  - Color-coded bar representations corresponding to goal progress statuses.
  - **Workload Alert system** that automatically flags monthly clusters if an employee or department has too many active deadlines due in the same calendar span.

### 5. What-If Scenario Simulator (`/scenarios`)

- **What it is**: A sandbox slider interface enabling managers to model prospective performance shifts.
- **Special Integrations**:
  - Live recalculation of overall organization progress scores and department averages.
  - Real-time Recharts bar visualizations reflecting simulated outcomes.
  - **Weightage Rebalancing guards** that trigger alerts if an employee's total goal weights deviate from 100%.
  - Snapshots repository allowing managers to save, load, and delete simulation configuration planners in MongoDB.

---

_Submitted for Corporate OKR Performance Hackathon 2026._
