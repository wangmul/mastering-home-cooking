-- Weeks master data
create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  week int not null unique,
  stage text not null,
  dish text not null,
  skill text not null,
  difficulty int not null check (difficulty between 1 and 10),
  time text not null,
  color text not null default '#3498db'
);

alter table public.weeks enable row level security;
do $$ begin
  create policy "Weeks readable by all" on public.weeks for select using (true);
exception when duplicate_object then null; end $$;

-- Per-user progress
create table if not exists public.progress (
  user_id uuid not null,
  week int not null references public.weeks(week) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, week)
);

create or replace function public.progress_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_progress_updated_at on public.progress;
create trigger trg_progress_updated_at
before update on public.progress
for each row execute procedure public.progress_set_updated_at();

alter table public.progress enable row level security;
do $$ begin
  create policy "Progress select own" on public.progress for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Progress upsert own" on public.progress for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Progress update own" on public.progress for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Per-user recipes for each week
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  week int not null references public.weeks(week) on delete cascade,
  title text not null,
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.recipes_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recipes_updated_at on public.recipes;
create trigger trg_recipes_updated_at
before update on public.recipes
for each row execute procedure public.recipes_set_updated_at();

alter table public.recipes enable row level security;
do $$ begin
  create policy "Recipes select own" on public.recipes for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Recipes insert own" on public.recipes for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Recipes update own" on public.recipes for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Recipes delete own" on public.recipes for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
