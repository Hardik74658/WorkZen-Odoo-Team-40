# WorkZen-Odoo Backend

FastAPI backend powering the WorkZen HRMS (Attendance, Leave, Payroll, Roles, Users).

## Settings (Admin Role Management)
The Settings page (frontend) consumes these admin-only endpoints:

`GET /settings/users/{company_id}` – List all users in a company with their current role.
`GET /settings/roles` – Fetch available roles for assignment.
`PUT /settings/update-role/{eid}` – Change a user role.
`PUT /settings/update-email/{eid}` – Update company or personal email.

All settings endpoints require an `Authorization: Bearer <token>` header belonging to an `admin` role user. Cross-company access is blocked.

## Quick Dev Run
1. Ensure MySQL running and credentials match `config/database.py`.
2. Install deps:
	```bash
	pip install -r requirements.txt
	```
3. Start API (adjust host/port as needed):
	```bash
	uvicorn main:app --reload --port 8000
	```
4. Frontend should point `VITE_API_BASE_URL` to `http://localhost:8000` (or proxy via `/api`).

## Token / Auth
Login via `POST /users/login` returns a JWT with `eid` + `role` claims. Use this token for protected endpoints.

## Lightweight Schema Guard
On startup `ensure_schema()` performs additive column checks so legacy DBs evolve safely.

---
Hackathon 2025 – WorkZen HRMS
