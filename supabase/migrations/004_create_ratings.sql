create table public.ratings (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.borrow_requests(id) on delete cascade,
  rater_id    uuid not null references public.profiles(id) on delete cascade,
  ratee_id    uuid not null references public.profiles(id) on delete cascade,
  score       int not null check (score between 1 and 5),
  comment     text,
  created_at  timestamptz default now() not null,
  -- One rating per participant per loan
  unique(request_id, rater_id)
);

create index ratings_ratee_id_idx   on public.ratings(ratee_id);
create index ratings_request_id_idx on public.ratings(request_id);

-- RLS
alter table public.ratings enable row level security;

-- Anyone can read ratings (shown on public profile pages)
create policy "ratings_public_read"
  on public.ratings for select
  using (true);

-- Users can only insert a rating where they are the rater,
-- and only for requests that have been returned
create policy "ratings_rater_insert"
  on public.ratings for insert
  with check (
    auth.uid() = rater_id
    and exists (
      select 1 from public.borrow_requests br
      where br.id = request_id
        and br.status = 'returned'
        and (br.borrower_id = auth.uid() or br.owner_id = auth.uid())
    )
  );

-- No updates or deletes on ratings — they are permanent records
