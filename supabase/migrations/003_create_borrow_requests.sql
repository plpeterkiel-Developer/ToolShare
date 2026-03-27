create type request_status as enum ('pending', 'approved', 'denied', 'cancelled', 'returned', 'overdue');

create table public.borrow_requests (
  id            uuid primary key default gen_random_uuid(),
  tool_id       uuid not null references public.tools(id) on delete cascade,
  borrower_id   uuid not null references public.profiles(id) on delete cascade,
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  status        request_status not null default 'pending',
  message       text,
  start_date    date,
  end_date      date,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index borrow_requests_tool_id_idx     on public.borrow_requests(tool_id);
create index borrow_requests_borrower_id_idx on public.borrow_requests(borrower_id);
create index borrow_requests_owner_id_idx    on public.borrow_requests(owner_id);
create index borrow_requests_status_idx      on public.borrow_requests(status);

create trigger borrow_requests_updated_at
  before update on public.borrow_requests
  for each row execute procedure public.set_updated_at();

-- DB trigger: sync tools.availability when a borrow request status changes
create or replace function public.sync_tool_availability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' then
    update public.tools set availability = 'on_loan' where id = new.tool_id;
  elsif new.status in ('returned', 'cancelled', 'denied') then
    -- Only reset to available if no other approved request exists for this tool
    if not exists (
      select 1 from public.borrow_requests
      where tool_id = new.tool_id
        and status = 'approved'
        and id != new.id
    ) then
      update public.tools set availability = 'available' where id = new.tool_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger sync_tool_availability_on_request_change
  after update of status on public.borrow_requests
  for each row execute procedure public.sync_tool_availability();

-- RLS
alter table public.borrow_requests enable row level security;

-- Both borrower and owner can view their shared requests
create policy "requests_participants_read"
  on public.borrow_requests for select
  using (auth.uid() = borrower_id or auth.uid() = owner_id);

-- Authenticated users can create requests for tools they don't own
create policy "requests_borrower_insert"
  on public.borrow_requests for insert
  with check (
    auth.uid() = borrower_id
    and auth.uid() != owner_id
  );

-- Owner can approve/deny; borrower can cancel (only if pending)
create policy "requests_participants_update"
  on public.borrow_requests for update
  using (
    auth.uid() = owner_id
    or (auth.uid() = borrower_id and status = 'pending')
  );
