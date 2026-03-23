# Warm (social app)

Next.js app lives in **`web/`**. Product notes: `Social_App_Instructions`.

## Deploy on Vercel

1. Push this repository to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com), **Add New Project** → import that repository.
3. Set **Root Directory** to `web` (not the repo root).
4. Framework preset should detect **Next.js**; leave default build/output settings.
5. After you add a hosted database (Phase 1 plan: Neon or Supabase), add **`DATABASE_URL`** (and any other secrets) under Project → **Environment Variables**, then redeploy.

Local dev: `cd web && npm install && npm run dev`.
