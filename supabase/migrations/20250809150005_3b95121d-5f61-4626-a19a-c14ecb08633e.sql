-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";
create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- Core tables
create table if not exists public.tools(
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  vendor text,
  homepage_url text,
  description text,
  is_oss boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tool_categories(
  tool_id uuid references public.tools(id) on delete cascade,
  category text not null,
  confidence real default 0.9,
  primary key(tool_id, category)
);

create table if not exists public.ranking_signals_raw(
  tool_id uuid references public.tools(id) on delete cascade,
  category text not null,
  as_of_date date not null,
  signal_key text not null,
  signal_value_float real not null,
  primary key(tool_id, category, as_of_date, signal_key)
);

create table if not exists public.ranking_daily(
  tool_id uuid references public.tools(id) on delete cascade,
  category text not null,
  as_of_date date not null,
  score_float real not null,
  rank_int int not null,
  delta_vs_yesterday_int int default 0,
  primary key(tool_id, category, as_of_date)
);
create index if not exists idx_ranking_daily_cat_date_rank on public.ranking_daily(category, as_of_date, rank_int);

create table if not exists public.admin_weights(
  category text primary key,
  weight_json jsonb not null,
  updated_by text,
  updated_at timestamptz default now()
);

create table if not exists public.update_log(
  id bigserial primary key,
  job text not null,       -- INGEST_DAILY | RANK_RECALC_DAILY | INGEST_RSS
  status text not null,    -- success | error
  info jsonb,
  finished_at timestamptz default now()
);

-- Sources & content
create table if not exists public.releases(
  id uuid primary key default gen_random_uuid(),
  tool_id uuid references public.tools(id) on delete cascade,
  version text,
  release_date date,
  notes_md text,
  source_url text,
  changelog_hash text
);

create table if not exists public.sources(
  id uuid primary key default gen_random_uuid(),
  tool_id uuid references public.tools(id) on delete cascade,
  source_type text,        -- github|rss|blog|docs
  url text,
  domain text,
  credibility_score real default 0.8,
  last_crawled_at timestamptz
);

-- Enable RLS
alter table public.tools enable row level security;
alter table public.tool_categories enable row level security;
alter table public.ranking_signals_raw enable row level security;
alter table public.ranking_daily enable row level security;
alter table public.admin_weights enable row level security;
alter table public.update_log enable row level security;
alter table public.releases enable row level security;
alter table public.sources enable row level security;

-- Read policies for anon
create policy if not exists "read" on public.tools for select to anon using (true);
create policy if not exists "read" on public.tool_categories for select to anon using (true);
create policy if not exists "read" on public.ranking_daily for select to anon using (true);
create policy if not exists "read" on public.releases for select to anon using (true);
create policy if not exists "read" on public.update_log for select to anon using (true);
create policy if not exists "read" on public.admin_weights for select to anon using (true);

-- Service role full access (redundant but explicit)
create policy if not exists "svc_all_tools" on public.tools for all to service_role using (true) with check (true);
create policy if not exists "svc_all_tool_categories" on public.tool_categories for all to service_role using (true) with check (true);
create policy if not exists "svc_all_signals" on public.ranking_signals_raw for all to service_role using (true) with check (true);
create policy if not exists "svc_all_ranking" on public.ranking_daily for all to service_role using (true) with check (true);
create policy if not exists "svc_all_weights" on public.admin_weights for all to service_role using (true) with check (true);
create policy if not exists "svc_all_updates" on public.update_log for all to service_role using (true) with check (true);
create policy if not exists "svc_all_releases" on public.releases for all to service_role using (true) with check (true);
create policy if not exists "svc_all_sources" on public.sources for all to service_role using (true) with check (true);

-- Seed admin_weights for 24 categories
insert into public.admin_weights(category, weight_json)
values
('Research & Papers','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Website Builders','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Automation/Agents','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Marketing','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Customer Support','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Sales Enablement','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Education','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Content Writing','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Video Editing','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Image Generation','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Data Analysis/BI','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Cybersecurity','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Finance/Fintech','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Healthcare','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Gaming','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Coding & DevTools','{"performance":0.3,"adoption":0.2,"satisfaction":0.15,"innovation":0.2,"docs":0.1,"value":0.05}'),
('E-commerce','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Translation/Localization','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('HR/Recruiting','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Legal/Compliance','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Product/UX','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Audio/Voice','{"performance":0.25,"adoption":0.2,"satisfaction":0.2,"innovation":0.2,"docs":0.1,"value":0.05}'),
('Search & RAG Infra','{"performance":0.3,"adoption":0.2,"satisfaction":0.15,"innovation":0.25,"docs":0.1,"value":0.0}'),
('MLOps/LLMOps','{"performance":0.3,"adoption":0.2,"satisfaction":0.15,"innovation":0.25,"docs":0.1,"value":0.0}')
on conflict (category) do nothing;

-- Schedule daily cron jobs (using project ref and anon key)
select
  cron.schedule(
    'ingest-github-daily-0400',
    '0 4 * * *',
    $$
    select net.http_post(
      url:='https://jtyjewzulygflrrfszre.supabase.co/functions/v1/ingest-github',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eWpld3p1bHlnZmxycmZzenJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NDcyODQsImV4cCI6MjA3MDMyMzI4NH0.3hJ5ELdTXI1dPFLmbusGDsbR7hC5v1LO6u7IdjQyO3c"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
    $$
  );

select
  cron.schedule(
    'rank-recompute-daily-0530',
    '30 5 * * *',
    $$
    select net.http_post(
      url:='https://jtyjewzulygflrrfszre.supabase.co/functions/v1/rank-recompute',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eWpld3p1bHlnZmxycmZzenJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NDcyODQsImV4cCI6MjA3MDMyMzI4NH0.3hJ5ELdTXI1dPFLmbusGDsbR7hC5v1LO6u7IdjQyO3c"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
    $$
  );