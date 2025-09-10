-- Supabase schema for simple page storage
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pages_updated_at on public.pages;
create trigger trg_pages_updated_at
before update on public.pages
for each row execute procedure public.set_updated_at();

-- Enable RLS and simple policies: read for all, write via service role
alter table public.pages enable row level security;

do $$ begin
  create policy "Pages are readable by all" on public.pages
    for select using (true);
exception when duplicate_object then null; end $$;

-- No insert/update/delete policies for anonymous; use service role for mutations.

