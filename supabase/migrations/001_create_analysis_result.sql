-- 001_create_analysis_result.sql
-- Create analysis_result table for NewsLens
--
-- Note: Ensure the pgcrypto extension is available for gen_random_uuid();
-- in Supabase it's typically available by default.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.analysis_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id text NOT NULL UNIQUE,
  json_result jsonb NOT NULL,
  version_id text,
  schema_version text,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookup by result_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_analysis_result_result_id ON public.analysis_result(result_id);

-- Consider also indexing by created_at if you query by time
CREATE INDEX IF NOT EXISTS idx_analysis_result_created_at ON public.analysis_result(created_at);
