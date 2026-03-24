# Warm (social app)

Next.js lives at the **repository root** (`package.json` here). Notes: `Social_App_Instructions`.

## Vercel (no local CLI required)

Deployments run from GitHub; you only need the Vercel dashboard.

1. **Root Directory** is **not** under *Settings → General*. Use **[Settings → Build and Deployment](https://vercel.com/docs/deployments/configure-a-build)** (same area as Framework / Build Command). Leave **Root Directory** empty so it uses the repo root (where this `package.json` is).
2. This repo includes **`vercel.json`**, which sets the framework to **Next.js** and pins install/build to `npm install` and `npm run build`, so detection does not depend on dashboard presets.
3. Set **`DATABASE_URL`** to your **PostgreSQL** connection string under *Settings → Environment Variables* (Production + Preview as needed) and redeploy. The build runs **`prisma migrate deploy`** so tables are created automatically.

Repository: [github.com/dkaplev/Social_app](https://github.com/dkaplev/Social_app).

## Database (Prisma + PostgreSQL)

- Schema: `prisma/schema.prisma`. Client singleton: `lib/db/prisma.ts`.
- Migrations live in `prisma/migrations/`. **Vercel:** `npm run build` runs `prisma migrate deploy` (needs `DATABASE_URL` in project env). **Local:** copy `.env.example` to `.env.local`, then `npm run db:migrate` or `npx prisma migrate deploy`.
- Seed (demo user + one friend): `npm run db:seed` (requires `DATABASE_URL` in `.env.local`).
- SQLite is not used: serverless hosts (Vercel) cannot rely on a local `file:` database for production traffic.

## Auth (Phase 1 stub)

Friends are scoped to a **default user**: the oldest `User` row, or a new empty user on first use. Replace with real auth when you add it.

## Phase 1 MVP (implemented)

- **Dashboard** (`/`) — temperature counts, coldest-first friends, **Plan this week**.
- **Friends** — CRUD list, detail with prefs, invites, upcoming hang, reschedule, recent feedback.
- **Plan** (`/friends/[id]/plan`) — rule-based 3 suggestions, micro-question for weekday evenings when confidence is low, **Create invite** (+ optional ritual flag).
- **Share** (`/friends/[id]/invites/[inviteId]`) — public URL, copy link, message templates (friendly / short / direct).
- **Public vote** (`/i/[token]`) — pick a slot, optional counter-note, 14-day expiry, **.ics** download after accept.
- **Events** (`/events/[id]`) — details, in-app **.ics**, post-meetup **feedback** (updates pair weights).
- **Graph** (`/graph`) — circular layout, color by temperature, click → friend.
- **How to use** (`/how`).
- **Analytics** — `AnalyticsEvent` table + dev-only **`/admin/debug`** (counts by event name).
- **Demo** — footer **Load demo data (dev)** resets and seeds 10 friends + sample invites/events/feedback.

Production: **`DATABASE_URL`** must be a reachable Postgres URL; migrations apply on each deploy via the build script.
