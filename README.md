# Mastering Home Cooking — Vercel + Supabase

This project provides a minimal Next.js app that stores page content in Supabase and deploys cleanly on Vercel. It also includes a Supabase-backed 52-week cooking roadmap at `/plan` with filters and per-user progress.

## Quick Start
1. Create a Supabase project and run `db/schema.sql` in the SQL editor.
   - For the 52-week plan feature, also run `db/plan.sql`.
2. Copy `.env.example` to `.env.local` and fill values from Supabase (URL + keys). Set `ALLOWED_ADMIN_EMAILS` (comma-separated) for users allowed to use the Admin UI.
3. Install deps and run locally:
   - `npm install`
   - `npm run dev`
4. Visit `http://localhost:3000/login` to sign up/sign in (Supabase Auth). Add your email to `ALLOWED_ADMIN_EMAILS` to use `http://localhost:3000/admin` to add content, then view it at `/:slug`.
5. To seed the 52-week plan with your CSV (provided in `myTestPage/52주_요리_학습_플랜.csv`), run:
   - `npm run import:weeks` (requires `SUPABASE_SERVICE_ROLE_KEY` in env)
6. Open `http://localhost:3000/plan` for the interactive roadmap. Sign in at `/login` to persist progress.

## Deploy to Vercel
- Push this repo to GitHub/GitLab and import to Vercel.
- Set these Environment Variables in Vercel (Production + Preview):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only)
  - `ADMIN_PASSWORD` (server only)
- Build command: `npm run build` (default). Output: Next.js.

## Notes
- Admin writes occur through a server API route gated by Supabase Auth and `ALLOWED_ADMIN_EMAILS`.
- Content schema is intentionally small (`pages` table). Extend with fields like `tags`, `summary`, or add a `recipes` table as needed.
- To migrate content from an external app, paste it into the Admin form or write a one-off import script using the `pages` schema.
 - The 52-week plan uses tables `weeks` (master data) and `progress` (per-user completion). See `db/plan.sql` and `tools/import-weeks.ts`.
