# GoalGrid — AtomQuest Hackathon 1.0 Submission Report Content

Copy-paste the structured sections below directly into your Hackathon Submission PDF or Slide Deck. This content has been curated to match your exact codebase implementation and will maximize your scores across all evaluation parameters.

---

## 📄 SECTION 1: EXECUTIVE SUMMARY & ONE-LINE PITCH

### Slide / Page Title: **Project Pitch & Executive Summary**

*   **One-Line Pitch**: 
    > GoalGrid is an AI-powered corporate performance management system built to eliminate fragmented spreadsheets and email threads, enabling seamless goal cascades, automated progress calculations, and employee wellbeing sentiment tracking on a single secure MERN platform.
*   **The Problem Context**:
    *   Manual goal setting creates critical organizational blind spots.
    *   Managers lack real-time visibility into employee objective progress.
    *   Employees struggle to align personal goals to strategic corporate priorities.
    *   HR teams suffer from intensive manual Excel consolidations at appraisal cycles.
*   **The GoalGrid Solution**:
    *   An intuitive, corporate-grade web portal serving Employees, Managers, and Admins.
    *   Rigorous mathematical UoM math engines automating Q1–Q4 planned vs. actual indexes.
    *   Dual-LLM AI Suite supporting **Google Gemini API** & **Anthropic Claude API** for real-time audits.
    *   Floating **Hackathon Demo Control Panel** enabling judges to run role switches in 1-click.

---

## 📄 SECTION 2: PHASE 1 & PHASE 2 CORE BRD IMPLEMENTATION

### Slide / Page Title: **Goal Creation, Workflow & Achievement Tracking**

*   **Phase 1 — Goal Creation & Approval (Must-Haves)**:
    *   **Thrust Areas**: Users align objectives to key operational domains (e.g. Revenue Growth, Product Scale, Talent Acquisition).
    *   **Unit of Measurement (UoM)**: Options for Numeric, Percentage, Date-based Timelines, or Zero-based targets.
    *   **Hardcoded Validation Guardrails**:
        *   Total goal weightages must sum to **exactly 100%**.
        *   No single goal can have a weightage **under 10%**.
        *   Employees are strictly capped at a **maximum of 8 goals**.
    *   **Manager L1 Workflow**: Managers can review pending goal sheets, edit targets/weightages inline, approve, or return them for rework. Upon approval, goal sheets are instantly **locked** to prevent further changes.
    *   **KPI Sync (Shared Goals)**: Admins/Managers push strategic goals down to team members. Recipients can only adjust weightages; Titles and Targets are read-only. Updates by the goal owner sync across all linked sheets in real time.
*   **Phase 2 — Achievement Tracking & Quarterly Check-ins**:
    *   **Quarterly Progress Matrix**: Structured inputs for Q1–Q4 planned vs. actual achievements.
    *   **UoM Math Engine**: Formulates exact achievement quotients:
        *   **Minimize (Higher is better)**: $Achievement \div Target$
        *   **Maximize (Lower is better)**: $Target \div Achievement$
        *   **Timeline**: Actual completion date measured against scheduled deadlines.
        *   **Zero-based (Zero is success)**: Flags $100\%$ if incidents = 0, otherwise $0\%$.
    *   **Manager Review Logs**: Managers review quarterly sheets side-by-side and log mandatory check-in discussion feedback.

---

## 📄 SECTION 3: GOOD-TO-HAVE BONUS FEATURES BUILT

### Slide / Page Title: **Enterprise Governance, Reporting & Notifications**

GoalGrid implements multiple **Good-to-Have (Section 5)** capabilities to capture maximum bonus credits:

1.  **Rule-Based Escalation Module** ([scheduler.service.js](file:///c:/Users/irfan/Desktop/AtomCusrt2/backend/src/services/scheduler.service.js)):
    *   Powered by a resilient `node-cron` background worker.
    *   Identifies employees with unsubmitted goals within active windows, managers delaying approvals, and lagging quarterly check-ins.
    *   Triggers automated email notification alerts directly to the employee's manager and HR skip-level contacts.
2.  **Corporate Reporting Engine** ([export.controller.js](file:///c:/Users/irfan/Desktop/AtomCusrt2/backend/src/controllers/export.controller.js)):
    *   Allows Admins and Managers to export full team achievement summaries in **XLSX (ExcelJS)** or **CSV (json2csv)** with a single click.
3.  **Real-Time Completion Cockpit**:
    *   An executive dashboard showing real-time, aggregated charts detailing which employees have completed or missed their quarterly check-ins.
4.  **Transaction Alert Framework**:
    *   **Nodemailer** dispatches immediate HTML/text notifications upon goal submissions, approvals, returns, and periodic reminders.
    *   Dedicated in-app **Notification Center** keeps employees informed even if they miss emails.

---

## 📄 SECTION 4: THE 5 STRATEGIC DIFFERENTIATORS (WINNER STATUS)

### Slide / Page Title: **Advanced Enterprise Differentiators**

GoalGrid includes 5 state-of-the-art corporate features that set it apart from basic CRUD submissions:

1.  **OKR Cascade Alignment Tree** (`/alignment-tree`):
    *   Visually maps the flow of strategic objectives from the **CEO** $\rightarrow$ **Managers** $\rightarrow$ **Employees** using Framer Motion.
    *   Calculates a global corporate **Strategy Alignment Score**.
    *   Flags **Orphaned Goals** lacking alignment.
2.  **Employee Wellbeing Pulse** (`/wellbeing`):
    *   Integrates mental health checks into quarterly check-ins (Confident, Challenged, Struggling, Blocked).
    *   Triggers **instant alert emails** to managers upon logging blocked or distressed states.
    *   Renders a departmental **Team Wellbeing Heatmap** for HR.
3.  **What-If Scenario Simulator** (`/scenarios`):
    *   A sandbox where managers slide progress rates and weightages to forecast team outcomes.
    *   Renders live Recharts bar charts reflecting simulated outcomes and validates weightage balances.
4.  **Goal Timeline Gantt View** (`/timeline`):
    *   Visualizes goal schedules and highlights calendar deadlocks if 3 or more deadlines cluster in the same month.
5.  **Multi-LLM AI Engine (Anthropic + Google)** (`/ai`):
    *   **SMART Goal Assistant**: Scores drafted objectives and suggests structural improvements.
    *   **Performance Review Generator**: Drafts quarterly summaries highlighting strengths, areas of concern, and numerical context.
    *   **Goal Risk Predictor**: Calculates a failure risk index using target variance and latency.
    *   **AI Chatbot Assistant**: Floating dashboard widget helping navigate and query database metrics.

---

## 📄 SECTION 5: SYSTEM ARCHITECTURE & TECH SPECIFICATIONS

### Slide / Page Title: **System Architecture & Tech Stack**

GoalGrid is architected as an enterprise-grade MERN application, optimized for $0 monthly operational cost:

*   **Frontend (Vercel CDN)**: React 18, Vite, Tailwind CSS (v4), Recharts, Lucide, Sonner.
*   **Backend (Render Web Service)**: Node.js, Express.js 5, JSON Web Tokens (httpOnly cookies), bcryptjs.
*   **Database (MongoDB Atlas Cloud)**: Document database utilizing Mongoose 9 schemas with indexing on `employee_id` for fast team querying.
*   **AI Service Core**: Powered by **Anthropic Claude API** (`claude-3-5-sonnet`) & **Google Gemini API** (`gemini-2.5-flash`) for hybrid redundancy and cost optimization.
*   **Visual Architecture Flow**:
    ```
    Client (React 18 / Vite / Vercel)
         ↓ (HTTPS / JWT Cookie Session)
    API Gateway (Express.js 5 / Render)
         ├─→ Mongoose ODM ──→ MongoDB Atlas Cloud
         ├─→ Node-Cron Reminders ──→ Brevo SMTP Alerting
         └─→ AI Service Core ──→ Anthropic Claude & Google Gemini
    ```
*   **Visual Database Schema (ERD Blueprint)**: 
    *   Refer to `database_erd_blueprint.png` in the repository root for the full MongoDB collections data model schema (Users, Goals, Conflicts, Scenarios, and Audit Logs relational references).

---

## 📄 SECTION 6: ACTIVE ENTERPRISE TEST CREDENTIALS

### Slide / Page Title: **Review Logins & Demo Access**

The database is pre-seeded with a hierarchical organizational structure. Use the **Hackathon Demo Panel** in the bottom-left corner of the website to switch perspectives in one click, or log in manually with the following credentials:

| Persona / Role | Email Account | Password | Department | Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / CEO** | `admin@company.com` | `Admin@123` | Leadership | Executive cockpit, audit trails, exports, cycles. |
| **Manager L1** | `manager@company.com` | `Manager@123` | Sales | Team reviews, inline goal edits, shared KPIs, wellbeing warnings. |
| **Employee** | `alice@company.com` | `Alice@123` | Sales | Goal drafts, quarterly check-ins, AI SMART audits, stress logs. |
| **Employee** | `bob@company.com` | `Bob@123` | Sales | KPI shared synchronization, gamified performance tracking. |
