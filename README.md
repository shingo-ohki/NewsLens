# NewsLens

Minimal local dev instructions

1. Install dependencies
```bash
npm install
```

2. Environment variables
- `OPENAI_API_KEY` (for production; dev uses mock by default) 
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, for saving results)
- Set `USE_MOCK_LLM=true` during development

3. Run app
```bash
npm run dev
```

4. Tests
```bash
# unit/integration (Vitest)
npm test

# e2e (Playwright)
npm run test:e2e
```

Notes:
- This project uses zod for JSON schema validation and a mock LLM in development.
- To connect to a real LLM, implement the OpenAI call in `lib/llm/index.ts`.

## Supabase migrations

SQL migration files are in `db/migrations`:
- `001_create_analysis_result.sql` — create `analysis_result` table
- `002_create_article.sql` — create `article` table
- `003_add_constraints_and_indexes.sql` — optional indexes & constraints

Apply them using `supabase db push` or running the SQL directly with `psql`.
