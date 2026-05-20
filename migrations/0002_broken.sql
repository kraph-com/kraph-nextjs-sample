-- Deliberately-broken migration for testing the retry/skip-migrations
-- flow. References a column that doesn't exist; should fail at apply
-- time with a Postgres error, leaving the rest of the build pipeline
-- to be exercised via "retry, skip migrations".

ALTER TABLE public.messages
  ADD CONSTRAINT messages_definitely_does_not_exist
  CHECK (this_column_does_not_exist > 0);
