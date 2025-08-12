-- Tighten RLS by removing overly permissive policies that allowed ALL operations for any role
-- Service role bypasses RLS, so edge functions remain unaffected

-- admin_weights: keep SELECT for authenticated users, remove ALL policy
DROP POLICY IF EXISTS "svc_all_admin_weights" ON public.admin_weights;

-- ranking_daily: keep public SELECT, remove ALL policy
DROP POLICY IF EXISTS "svc_all_ranking_daily" ON public.ranking_daily;

-- ranking_signals_raw: remove ALL policy so only service role (bypass) can access
DROP POLICY IF EXISTS "svc_all_signals" ON public.ranking_signals_raw;

-- releases: keep public SELECT, remove ALL policy
DROP POLICY IF EXISTS "svc_all_releases" ON public.releases;

-- sources: remove ALL policy to prevent public access
DROP POLICY IF EXISTS "svc_all_sources" ON public.sources;

-- tool_categories: keep public SELECT, remove ALL policy
DROP POLICY IF EXISTS "svc_all_tool_categories" ON public.tool_categories;

-- tools: keep public SELECT, remove ALL policy
DROP POLICY IF EXISTS "svc_all_tools" ON public.tools;

-- update_log: keep SELECT for authenticated only, remove ALL policy
DROP POLICY IF EXISTS "svc_all_update_log" ON public.update_log;