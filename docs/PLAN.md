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
| 4 | Business rules module + unit tests | done |
| 5 | Submit request endpoint | done |
| 6 | My requests endpoint (pagination) | done |
| 7 | Validator list endpoint (filters + pagination) | done |
| 8 | Approve / reject endpoints | done |
| 9 | Team planning endpoint | done |
| 10 | (extra) Edit/cancel pending request | done |
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
- Rule 1 (end after start) allows same-day requests (end == start). Why: a literal "strictly after" reading would make a 1-day vacation impossible to model, which doesn't match real usage.
- Rule 2 (no overlap) treats touching boundary dates as overlapping, and ignores rejected requests entirely. Why: each date is a whole calendar day, so sharing one is a genuine conflict; a rejected request never became a real vacation, so it shouldn't permanently block those dates.
- Rule 4 (no past requests) allows a start date of today. Why: today hasn't happened yet at submission time, so it isn't "the past."
- Dates are compared as plain "YYYY-MM-DD" strings, never converted to Date objects, in all business rule functions. Why: string comparison sorts identically to chronological order for this format, and sidesteps timezone bugs entirely rather than working around them.
- POST /vacation-requests is requester-only. Why: the spec cleanly separates "Requester Interface: submit" from "Validator Interface: review," and allowing validators to submit opens an unanswered question (who approves a validator's own request) that's out of scope.
- Overlap violations return 409 Conflict, while date-order/past-date violations return 400. Why: 409 is the more semantically correct status for "conflicts with an existing resource," distinct from malformed/invalid input.
- Every distinct outcome of this endpoint (201, both 400 paths, 403, 409) was manually verified against the real running dev server and the real database, not just unit tests. Why: passing unit tests proves internal logic consistency, not that the real HTTP/DB path actually behaves that way end to end.
- GET /vacation-requests/me requires only requireAuth, not a specific role. Why: it's inherently scoped to "my own data" regardless of role.
- Pagination response shape is { data, total, page, limit }, defaulting to page=1/limit=10; invalid page/limit values silently fall back to defaults rather than erroring. Why: standard shape so the frontend can compute total pages; a GET for your own data shouldn't 400 over a bad query param.
- User.password is now @Column({ select: false }) - never loaded by any query by default, anywhere, unless explicitly re-selected. Why: findAndCount's relations option loads the full related entity by default; a nested TypeORM select scoped to that relation turned out to break the count query entirely (confirmed by removing it), so the fix had to be at the entity level instead. login's query was updated to explicitly re-select password, since it needs the hash to compare against.
- GET /users (filter dropdown) returns requesters only, never validators. Why: validators can't submit requests, so they'd just be dead options that never match anything.
- An invalid ?status= value is silently ignored (treated as no filter), same philosophy as invalid pagination params. Why: a GET shouldn't error over a bad query param.
- GET /vacation-requests and POST /vacation-requests share the same root.yaml path key - YAML doesn't allow the same top-level mapping key twice, so both methods have to live under one shared path entry (get: and post: as siblings), not two separate ones. Caught immediately by cef-gen-handlers failing outright with a YAMLException, not a silent bug.
- Once a request leaves pending (approved OR rejected), it's locked from further action - a new isPending check, separate from isModifiable (rule 3's literal wording, != APPROVED only). Why: rule 3 is silent on rejected requests, and treating only "pending" as actionable is the simpler mental model, avoiding reopening a rejection by approving it later.
- Reject validates the comment (rule 5) before touching the database at all, same pattern as submit's date checks. Why: cheap, pure validation should happen before any DB work, not after.
- approveVacationRequest/rejectVacationRequest both guard with Number.isInteger(id) before querying, returning 404 immediately for a non-numeric id. Why: a malformed id can't exist either way, and passing NaN straight into a SQL query risked a 500 instead of a clean 404.
- Resolved the "team vacation planning for both roles" vague requirement: "team" means the whole company, since Users (id, name, email, password, role, created_at) has no team/department field and the spec doesn't call for adding one. Only approved requests count as "on vacation" - pending isn't confirmed, so showing it as fact could mislead planning. startDate/endDate are required query params (400 if missing), since there's no sensible default range for a calendar-style view.
- The overlap check for this endpoint runs at the database level via TypeORM's LessThanOrEqual/MoreThanOrEqual operators - the same inclusive-boundary formula as doesOverlap from chunk 4, just comparing against the query range instead of another request's dates.
- Built both edit and cancel (chunk 10, extra), scoped to the owner's own pending requests only, via a single query (where: { id, user: { id: userId } }) rather than a separate ownership check. Why: that pattern makes "doesn't exist" and "not yours" return the identical 404 for free, with no way to accidentally leak which case it was.
- Cancel hard-deletes the row rather than adding a CANCELLED status. Why: no schema change needed, and a cancelled pending request was never a confirmed commitment worth keeping a record of.
- Both edit and cancel require pending specifically (via isPending), not rule 3's literal wording. Why: consistent with chunk 8's decision that rejected is also final - a rejected request should be resubmitted fresh, not edited back to life. This left isModifiable (built in chunk 4 as a literal rule 3 check) unused by every real endpoint, since the stricter pending-only policy always ended up being the actual gate - so it was removed, along with its 2 tests, rather than kept as correct-but-unused code with a name that could be mistakenly called instead of isPending later.
- editVacationRequest excludes the request being edited from its own overlap check (otherRequests.filter(r => r.id !== id)). Why: without it, a valid edit could never succeed, since the request would always "overlap" its own prior dates.
