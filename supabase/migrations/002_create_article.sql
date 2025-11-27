-- 002_create_article.sql
-- Create article table used to store extracted article content and extraction status
--
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.article (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text,
  input_text_cleaned text,
  extraction_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_url ON public.article(url);
CREATE INDEX IF NOT EXISTS idx_article_created_at ON public.article(created_at);
