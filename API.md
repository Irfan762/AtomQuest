# GoalGrid API Documentation

Base URL: `/api`

## Authentication
- `POST /auth/register`: Register new employee.
- `POST /auth/login`: Login and receive JWT in cookies.
- `POST /auth/logout`: Clear session cookies.
- `GET /auth/me`: Get current user profile.

## Goals
- `GET /goals`: List goals (scoped by role).
- `POST /goals`: Create new goal (validates weightage & count).
- `PUT /goals/:goal_id`: Update goal (locked if approved).
- `DELETE /goals/:goal_id`: Delete goal (locked if approved).
- `POST /goals/:goal_id/submit`: Submit for manager approval.
- `PUT /goals/approve/:goal_id`: Approve and lock goal (Manager/Admin).
- `PUT /goals/reject/:goal_id`: Reject goal (Manager/Admin).
- `POST /goals/shared`: Push goal to multiple employees (Manager/Admin).

## Check-ins
- `POST /checkins/:goal_id`: Submit quarterly progress (Planned/Achieved).
- `POST /checkins/:goal_id/comment`: Add manager feedback to a check-in.

## Admin & Governance
- `POST /admin/unlock/:goal_id`: Unlock a goal and return to draft.
- `GET /admin/audit`: Retrieve system audit logs.
- `GET /export/goals/csv`: Download goals as CSV.
- `GET /export/goals/xlsx`: Download goals as XLSX.

## Analytics
- `GET /analytics/dashboard`: Get summary stats, trends, and team metrics.
