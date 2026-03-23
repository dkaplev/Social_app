# Warm (social app)

Next.js lives at the **repository root** (`package.json` here). Notes: `Social_App_Instructions`.

## Vercel (no local CLI required)

Deployments run from GitHub; you only need the Vercel dashboard.

1. **Root Directory** is **not** under *Settings → General*. Use **[Settings → Build and Deployment](https://vercel.com/docs/deployments/configure-a-build)** (same area as Framework / Build Command). Leave **Root Directory** empty so it uses the repo root (where this `package.json` is).
2. This repo includes **`vercel.json`**, which sets the framework to **Next.js** and pins install/build to `npm install` and `npm run build`, so detection does not depend on dashboard presets.
3. When you add a database, set **`DATABASE_URL`** under *Settings → Environment Variables* and redeploy.

Repository: [github.com/dkaplev/Social_app](https://github.com/dkaplev/Social_app).
