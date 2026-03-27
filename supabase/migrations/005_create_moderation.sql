create type report_reason as enum ('inappropriate', 'spam', 'broken_item', 'no_show', 'other');

create table public.reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.profiles(id) on delete cascade,
  reported_user_id  uuid references public.profiles(id) on delete set null,
  reported_tool_id  uuid references public.tools(id) on delete set null,
  reason            report_reason not null,
  details           text,
  resolved          boolean not null default false,
  created_at        timestamptz default now() not null
);

create index reports_reporter_id_idx      on public.reports(reporter_id);
create index reports_reported_user_id_idx on public.reports(reported_user_id);
create index reports_resolved_idx         on public.reports(resolved);

-- RLS
alter table public.reports enable row level security;

-- Only admins (service role) can read reports
-- Authenticated users can submit a report
create policy "reports_authenticated_insert"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- No public read — admin only via service role
