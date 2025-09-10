# Deploying to Vercel with Supabase

1) Supabase setup
- Create project at supabase.com. In SQL Editor, run `db/schema.sql`.
- Also run `db/plan.sql` for the 52-week plan tables.
- In Project Settings → API, copy:
  - `Project URL` → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` key → `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

2) Local development
- `cp .env.example .env.local` and fill all values (URLs + keys).
- Set `ALLOWED_ADMIN_EMAILS` (comma-separated) for admin users.
- `npm install` then `npm run dev` → open http://localhost:3000
- Use `/login` to sign in; `/admin` to upsert pages (allowed emails only). View content at `/:slug`.
- For the plan, run `npm run import:weeks` once to seed weeks from `myTestPage/52주_요리_학습_플랜.csv`.

3) Vercel deployment
- Import the repo in Vercel and add the same env vars in Project Settings → Environment Variables.
- Trigger a deploy. After build, open the site and use `/admin` to create your first page.

4) Optional hardening
- Replace password gate with Supabase Auth and add INSERT/UPDATE RLS policies for authenticated users. (Already configured for plan progress.)
- Store media in Supabase Storage and reference URLs in page bodies.
- If you intend to use image uploads, create a public bucket named `images` and adjust RLS as needed.
