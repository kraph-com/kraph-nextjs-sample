-- Kraph migration: applied automatically by the one-click deploy
-- orchestrator before the frontend build. Idempotent so re-deploys
-- don't fail if the table already exists.

CREATE TABLE IF NOT EXISTS public.messages (
  id          BIGSERIAL PRIMARY KEY,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public read so the anon key the SPA carries can SELECT.
-- Service-role writes only — keep RLS on so a leaked anon key can't
-- spam the table from the browser.
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_public_read" ON public.messages;
CREATE POLICY "messages_public_read"
  ON public.messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed a couple rows so the page has something to render on first deploy.
INSERT INTO public.messages (body) VALUES
  ('hello from kraph 👋'),
  ('this row was inserted by migrations/0001_init.sql at deploy time'),
  ('edit migrations/0001_init.sql in the repo, push, and the auto-redeploy hook will re-run this on the live instance')
ON CONFLICT DO NOTHING;
