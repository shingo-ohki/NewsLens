-- 003_add_constraints_and_indexes.sql
-- Add extra indexes and constraints for production use

-- Ensure result_id is unique (already enforced) and create btree index for json_querying if needed
CREATE INDEX IF NOT EXISTS idx_analysis_result_model ON public.analysis_result(model);

-- If you query inside json_result often, consider adding GIN indexes:
CREATE INDEX IF NOT EXISTS idx_analysis_result_json_gin ON public.analysis_result USING gin (json_result jsonb_path_ops);

-- Add foreign key example: if article.id is referenced in analysis_result in future
-- ALTER TABLE public.analysis_result ADD COLUMN article_id uuid;
-- ALTER TABLE public.analysis_result ADD CONSTRAINT fk_article FOREIGN KEY (article_id) REFERENCES public.article (id);
