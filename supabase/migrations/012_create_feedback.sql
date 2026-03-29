create type feedback_type as enum ('feedback', 'bug', 'suggestion');

create table public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  type        feedback_type not null,
  message     text not null,
  created_at  timestamptz default now() not null
);

create index feedback_user_id_idx    on public.feedback(user_id);
create index feedback_type_idx       on public.feedback(type);
create index feedback_created_at_idx on public.feedback(created_at desc);

-- RLS
alter table public.feedback enable row level security;

-- Authenticated users can submit feedback
create policy "feedback_authenticated_insert"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- No public read — admin only via service role
