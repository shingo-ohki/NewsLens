-- 004_enable_rls_and_policies.sql
-- Enable RLS and add basic policies for public read and server-side insert

-- Enable RLS on analysis_result
ALTER TABLE IF EXISTS public.analysis_result ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT (for public result pages / r/:id)
DROP POLICY IF EXISTS "Allow public select" ON public.analysis_result;
CREATE POLICY "Allow public select" ON public.analysis_result
  FOR SELECT USING (true);

-- Note: SUPABASE_SERVICE_ROLE_KEY bypasses RLS so server-side inserts work without a policy

-- Enable RLS on article
ALTER TABLE IF EXISTS public.article ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT on article (if you want articles to be retrievable)
DROP POLICY IF EXISTS "Allow public select on article" ON public.article;
CREATE POLICY "Allow public select on article" ON public.article
  FOR SELECT USING (true);

-- Optionally, restrict INSERT on article to authenticated users only
-- This is useful if the app allows client-side article creation by authenticated users.
-- Uncomment the next block if you want to allow only authenticated users to insert.
--
-- CREATE POLICY IF NOT EXISTS "Allow authenticated inserts on article" ON public.article
--   FOR INSERT USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Optional: add policy to prevent anonymous updates/deletes
-- CREATE POLICY IF NOT EXISTS "Deny anonymous updates" ON public.analysis_result
--   FOR UPDATE USING (auth.role() = 'authenticated');
