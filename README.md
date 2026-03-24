# Warm (social app)

Next.js lives at the **repository root** (`package.json` here). Notes: `Social_App_Instructions`.

## Vercel (no local CLI required)

Deployments run from GitHub; you only need the Vercel dashboard.

1. **Root Directory** is **not** under *Settings → General*. Use **[Settings → Build and Deployment](https://vercel.com/docs/deployments/configure-a-build)** (same area as Framework / Build Command). Leave **Root Directory** empty so it uses the repo root (where this `package.json` is).
2. This repo includes **`vercel.json`**, which sets the framework to **Next.js** and pins install/build to `npm install` and `npm run build`, so detection does not depend on dashboard presets.
3. When you add a database, set **`DATABASE_URL`** under *Settings → Environment Variables* and redeploy.

Repository: [github.com/dkaplev/Social_app](https://github.com/dkaplev/Social_app).

## Database (Prisma + SQLite)

- Schema: `prisma/schema.prisma`. Client singleton: `lib/db/prisma.ts`.
- Migrations live in `prisma/migrations/` (apply on a new machine with `DATABASE_URL` set, e.g. from `.env.example`).
- Seed (demo user + one friend): `npm run db:seed` (requires `DATABASE_URL` in `.env.local`).
- Production: use Postgres (Neon / Supabase / Vercel Postgres), change `provider` + `url` in the datasource, and run `prisma migrate deploy` in your release pipeline; SQLite is not suitable for serverless runtime data.

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

Production: point `DATABASE_URL` at Postgres, switch `provider` in `schema.prisma`, run **`npx prisma migrate deploy`** after deploy.
