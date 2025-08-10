-- Move extensions from public to extensions schema to satisfy security linter
create schema if not exists extensions;

-- pgcrypto
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN
    DROP EXTENSION pgcrypto;
  END IF;
END$$;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- vector
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    DROP EXTENSION vector;
  END IF;
END$$;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- pg_cron
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    DROP EXTENSION pg_cron;
  END IF;
END$$;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- pg_net
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
  ) THEN
    DROP EXTENSION pg_net;
  END IF;
END$$;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;