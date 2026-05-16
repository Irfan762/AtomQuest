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

## 🧪 Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Admin@123` |
| **Manager** | `manager@company.com` | `Manager@123` |
| **Employee** | `alice@company.com` | `Alice@123` |

## 📐 Architecture

- **Backend**: Controller-Service-Model architecture with centralized error handling and audit middleware.
- **Frontend**: Component-based architecture with Context API for state management and Axios interceptors for auth.

---

*Submitted for [Hackathon Name] 2026.*
