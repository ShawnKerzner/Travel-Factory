# Plan

Take-home: Vacation Management web app (Travelfactory Full Stack Engineer intern assignment).
Stack: Vue 3 + Vuex 4 (frontend), Node.js + TypeORM + PostgreSQL (backend), Common Event Framework, Tailwind CSS.

## Chunk list

| # | Chunk | Status |
|---|---|---|
| 0 | Repo & structure | in progress |
| 1 | CEF spike | not started |
| 2 | Database (entities, migration, seed) | not started |
| 3 | Auth (JWT login, role checks) | not started |
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
