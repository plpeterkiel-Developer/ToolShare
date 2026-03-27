-- Adds test_run_id to seeded tables for BDD test isolation.
-- Each E2E test scenario tags its seeded rows with a unique UUID.
-- The After hook deletes all rows matching that UUID after the scenario.
-- This allows parallel test execution without data collisions.
--
-- These columns have no effect in production — they simply remain NULL.

alter table public.profiles
  add column if not exists test_run_id uuid;

alter table public.tools
  add column if not exists test_run_id uuid;

alter table public.borrow_requests
  add column if not exists test_run_id uuid;

-- Indexes for fast cleanup queries in After hooks
create index if not exists profiles_test_run_id_idx       on public.profiles(test_run_id);
create index if not exists tools_test_run_id_idx          on public.tools(test_run_id);
create index if not exists borrow_requests_test_run_id_idx on public.borrow_requests(test_run_id);
