-- Restrict public read access on sensitive tables and create authenticated-only policies

-- Admin weights: remove public SELECT and require authenticated users
DROP POLICY IF EXISTS "read_admin_weights" ON public.admin_weights;
CREATE POLICY "read_admin_weights_auth"
ON public.admin_weights
FOR SELECT
USING (auth.role() = 'authenticated');

-- Update log: remove public SELECT and require authenticated users
DROP POLICY IF EXISTS "read_update_log" ON public.update_log;
CREATE POLICY "read_update_log_auth"
ON public.update_log
FOR SELECT
USING (auth.role() = 'authenticated');
