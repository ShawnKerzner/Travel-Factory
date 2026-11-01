# Plan

Take-home: Vacation Management web app (Travelfactory Full Stack Engineer intern assignment).
Stack: Vue 3 + Vuex 4 (frontend), Node.js + TypeORM + PostgreSQL (backend), Common Event Framework, Tailwind CSS.

## Chunk list

| # | Chunk | Status |
|---|---|---|
| 0 | Repo & structure | done |
| 1 | CEF spike | done |
| 2 | Database (entities, migration, seed) | done |
| 3 | Auth (JWT login, role checks) | done |
| 4 | Business rules module + unit tests | not started |
| 5 | Submit request endpoint | not started |
| 6 | My requests endpoint (pagination) | not started |
| 7 | Validator list endpoint (filters + pagination) | not started |
| 8 | Approve / reject endpoints | not started |
| 9 | Team planning endpoint | not started |
| 10 | (extra) Edit/cancel pending request | not started |
| 11 | Frontend setup (Vite, Tailwind, Router, Vuex, Axios) | not started |
| 12 | Login + auth store + route guards | not started |
| 13 | Requester page | not started |
| 14 | Validator dashboard | not started |
| 15 | Team planning view | not started |
| 16 | (extra) UX extras | not started |
| 17 | Wrap-up (README, final review) | not started |

## Decision log

- Project set up as its own repo at `vacation-management/`, separate from the DI_Bootcamp exercises repo. Why: DI_Bootcamp has its own unrelated CLAUDE.md contract (a progress-tracking coach for bootcamp exercises); this is a different, standalone project.
- Backend and frontend: TypeScript. Why: TypeORM's decorator-based entities and CEF's typed handlers are built around TypeScript; JavaScript would lose most of that benefit.
- Business actions (submit/approve/reject) are modeled as domain commands handled by pure command-handler functions, which emit typed domain events (VacationRequestSubmitted/Approved/Rejected) through a small in-process EventEmitter-based bus. CEF route handlers stay thin adapters (parse HTTP -> build command -> dispatch -> return result). Why: directly satisfies the "proper use of commands/events" grading criterion, and keeps command handlers unit-testable as plain functions with no HTTP/CEF involved.
- PostgreSQL runs via Docker Compose (docker-compose.yml), not a local install. Why: consistent setup regardless of machine, and makes spinning up a separate vacation_test database trivial (docker/init-test-db.sql).
- Docker's host port is 5433, not Postgres's default 5432. Why: this machine already had a local PostgreSQL Windows service bound to 5432; remapping avoided touching that pre-existing service.
- Password hashing uses bcryptjs, not native bcrypt. Why: pure JS, no native build step, so it installs reliably on any machine that grades this.
- User ids are a simple auto-incrementing integer (@PrimaryGeneratedColumn), not a UUID. Why: spec only requires "id" with no format; simplest option for a take-home.
- Every commit includes a short body explaining why the change was made, not just a Conventional Commits title. Why: the assignment calls for "meaningful commits," and since this code gets explained in a follow-up interview, the git history itself should carry that context, not just this log.
- Login returns the exact same 401 message for "no such user" and "wrong password." Why: a different message per case would let an attacker discover which emails have real accounts.
- requireRole(role) internally runs the same check as requireAuth, rather than requiring both to be composed together. Why: a role can't be trusted without first verifying the token's signature, so role-checking already implies auth-checking; composing both separately would be redundant.
- Jest + ts-jest for the test runner. Why: standard pairing for a TypeScript/Node backend, no extra configuration for the project's module system.
- Tests point at vacation_test via a Jest setupFiles script that sets DB_NAME before dotenv loads the rest of .env. Why: TypeScript hoists import statements above other code, so setting the env var directly in a test file would run too late; setupFiles runs before any test file loads.
