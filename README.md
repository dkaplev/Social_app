# Warm (social app)

Next.js app is at the **repository root** (so Vercel’s default root matches `package.json`). Product notes: `Social_App_Instructions`.

## Deploy on Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), **Add New Project** → import [dkaplev/Social_app](https://github.com/dkaplev/Social_app).
3. Leave **Root Directory** empty (or `.`) — do **not** set it to `web` (that folder no longer exists).
4. Framework should detect **Next.js**; defaults for install/build are fine.
5. When you add a hosted database (Neon / Supabase / Vercel Postgres), set **`DATABASE_URL`** under Project → **Environment Variables**, then redeploy.

Local dev: `npm install && npm run dev`.
