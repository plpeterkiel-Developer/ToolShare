-- Feature usage tracking
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,          -- 'page_view' | 'action'
  event_name TEXT NOT NULL,          -- e.g. 'tools_browse', 'tool_create', 'borrow_request'
  page_path TEXT,                    -- e.g. '/tools', '/tools/[id]'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_events_event_name ON public.usage_events(event_name);
CREATE INDEX idx_usage_events_created_at ON public.usage_events(created_at DESC);
CREATE INDEX idx_usage_events_type_name ON public.usage_events(event_type, event_name);
CREATE INDEX idx_usage_events_user_id ON public.usage_events(user_id);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (authenticated or anonymous via anon key)
CREATE POLICY "Allow insert for all" ON public.usage_events
  FOR INSERT WITH CHECK (true);

-- Only service role (admin client) can read — RLS blocks normal users
CREATE POLICY "Admin read only" ON public.usage_events
  FOR SELECT USING (false);
