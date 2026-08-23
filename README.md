# Campus Connect

A peer-to-peer marketplace for university communities — rentals & sales, a
"project graveyard" for selling unfinished projects, academic notes, skill/tutor
sharing, subscription splitting, escrow deals with QR handover, chat, and trust
scores.

This is a **fully self-contained** build with **no external platform
dependencies** (no Kimi). Authentication is local email + password.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v3 + shadcn/ui + React Router
- **Backend:** Node.js + Hono + tRPC (type-safe API), served by the same Vite
  dev server in development
- **Database:** SQLite via libSQL + Drizzle ORM
- **Auth:** local email/password — passwords hashed with Node's built-in
  `crypto.scrypt`; session is a signed JWT stored in an httpOnly cookie

## Getting started

```bash
npm install

# 1. Create the database tables from the Drizzle schema
npm run db:push

# 2. (optional) Seed demo users + marketplace data
npm run db:seed

# 3. Start the dev server (frontend + API on http://localhost:3000)
npm run dev
```

### Run on a public IP (production)

```bash
npm run build
PORT=3000 npm start        # binds 0.0.0.0 -> http://<your-public-ip>:3000
```

- Override the port with `PORT=80 npm start` (ports < 1024 need root) or the bind
  address with `HOST=0.0.0.0`.
- Open the port in your firewall / cloud security-group inbound rules.
- Over plain HTTP the session cookie is `SameSite=Lax` (non-Secure) so login
  works on a bare IP. If you put it behind an HTTPS reverse proxy that sets
  `X-Forwarded-Proto: https`, it automatically upgrades to `Secure` + `SameSite=None`.

### Demo accounts

After `npm run db:seed`, sign in with any of these (password: `password123`):

- `alex@campus.edu`
- `sara@campus.edu`
- `bilal@campus.edu`
- `hina@campus.edu`

Or create a fresh account at `/register`.

## Environment

Copy `.env.example` to `.env` (a ready-to-run `.env` is already included for
local dev). Key variables:

| Variable       | Purpose                                              |
| -------------- | ---------------------------------------------------- |
| `APP_SECRET`   | Secret used to sign/verify the session JWT           |
| `DATABASE_URL` | SQLite/libSQL URL, e.g. `file:./local.db`            |
| `OWNER_EMAIL`  | (optional) account with this email becomes `admin`   |

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Vite dev server + Hono API (port 3000)       |
| `npm run build`    | Build the client and bundle the API server   |
| `npm start`        | Run the production server (after `build`)     |
| `npm run db:push`  | Push the Drizzle schema to the database      |
| `npm run db:seed`  | Seed demo users + sample data                |
| `npm run check`    | TypeScript type-check                        |
| `npm run lint`     | ESLint                                       |

## Project structure

```
api/            Hono + tRPC backend
  auth/         local email/password auth (password hashing, JWT session)
  queries/      Drizzle data-access helpers
  *-router.ts   tRPC routers (items, projects, subscriptions, tutors, …)
contracts/      shared types/constants between client and server
db/             Drizzle schema, migrations, seed
src/            React app (pages, components, hooks)
```
