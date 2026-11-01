# Vacation Management

A take-home assignment for a Full Stack Engineer internship at Travelfactory: a web app for submitting and reviewing employee vacation requests, with separate interfaces for **Requesters** (employees) and **Validators** (managers).

## Tech stack

- **Backend:** Node.js + TypeScript, built around the [Common Event Framework](https://www.npmjs.com/package/commoneventframework) (CEF), PostgreSQL via TypeORM, JWT auth
- **Frontend:** Vue 3 + TypeScript, Vuex 4, Vue Router, Axios, Tailwind CSS v4
- **Testing:** Jest (backend), Vitest + Vue Test Utils (frontend)
- **Database:** PostgreSQL, run via Docker Compose

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for PostgreSQL)

## Installation

```bash
git clone <this-repo-url>
cd vacation-management
cd backend && npm install
cd ../frontend && npm install
```

## Database setup

From the repository root:

```bash
docker compose up -d
```

This starts a PostgreSQL container and creates two databases on first run: `vacation_dev` and `vacation_test`. It's mapped to host port **5433**, not the default 5432 — this machine already had a local PostgreSQL service bound to 5432, so Docker was remapped to avoid touching it. If your machine is different, you can change the port mapping in `docker-compose.yml` and `backend/.env` together.

Then, from `backend/`:

```bash
cp .env.example .env    # defaults already match docker-compose.yml
npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts
npx ts-node src/seed.ts
```

The migration creates the schema; the seed script creates three demo users (hashed passwords, not plaintext):

| Email | Password | Role |
|---|---|---|
| alice@example.com | password123 | Requester |
| bob@example.com | password123 | Requester |
| carla@example.com | password123 | Validator |

## Running the app

Two terminals, from the repo root:

```bash
cd backend && npm run dev
```
Backend runs at `http://localhost:8888`.

```bash
cd frontend && cp .env.example .env && npm run dev
```
Frontend runs at `http://localhost:5173`. Log in with any of the demo accounts above.

## Running tests

```bash
cd backend && npm test     # 64 tests
cd frontend && npm test    # 31 tests
```

Business rules, auth, every endpoint, and the named frontend pieces (form validation, status badge, pagination, reject-with-comment) are unit tested. Route guards, full page flows (submit → list refresh, approve/reject, filters), and the UX extras (day count, toasts, cancel) were verified live against the real running app and real database instead of duplicated as unit tests — see `docs/PLAN.md`'s decision log for exactly which outcome was tested which way, and why.

## Approach

Development went chunk by chunk — one feature at a time, each one scoped, edge-cased, tested, and committed before moving to the next. `docs/PLAN.md` has the full chunk list and a decision log recording every non-obvious choice made along the way (and why), including the handful of real bugs caught by testing against the actual running app rather than trusting that passing unit tests meant the feature worked end to end.

A few decisions worth calling out here:

- **Commands + events.** Submitting, approving, and rejecting a request are modeled as domain commands, each emitting a typed event (`VacationRequestSubmitted`/`Approved`/`Rejected`) on a small in-process event bus. CEF's own route handlers stay thin adapters around this, which is what the "proper use of commands/events" grading criterion is aimed at.
- **Business rules as pure functions.** All five business rules live in `backend/src/businessRules/vacationRequestRules.ts` as plain, dependency-free functions, unit tested independently of any HTTP or database concern.
- **"Team" is the whole company.** The spec's "team vacation planning" requirement was flagged as vague in planning; since `Users` has no team/department field and the spec didn't ask for one, "team" was scoped to mean everyone.
- **TypeScript throughout**, since both TypeORM and CEF are built around it.

## Known limitations

- **No real-time updates.** Lists refresh after an action completes, not via websockets/polling — if two validators have the dashboard open, one won't see the other's approval until they reload or act themselves.
- **Edit pending request has no frontend UI.** The backend endpoint (`PUT /vacation-requests/:id`) exists and is tested, but only Cancel got wired up to the requester page as a UX extra; editing in place was left out to keep scope to what was asked.
- **Single-container Postgres**, no replication/backup story — appropriate for a take-home, not for production.
- **JWT stored in `localStorage`**, which is standard for a small app but is readable by any script on the page if an XSS bug were ever introduced; there's no refresh-token rotation.
- **No team/department grouping.** Flagged above as a deliberate scoping decision, not an oversight.
- **CEF's CORS handling doesn't support the `PATCH` HTTP method** (confirmed by reading its source; no newer version exists that fixes it). Approve/reject/edit use `PUT` instead for exactly this reason.

## AI usage note

Code was written with Claude (Anthropic) under my direction, using a structured process: for every chunk, I agreed on scope, made the actual design decisions (including the ones that needed real tradeoffs, like the database port conflict, the commands/events architecture, and the CORS/PATCH workaround), specified edge cases and expected test outcomes up front, reviewed the generated code and had it explained back to me, and only committed once I understood it and the tests passed. `docs/PLAN.md`'s decision log is the record of that process — every entry there reflects a choice I made and can explain, not just a default Claude picked on its own.
