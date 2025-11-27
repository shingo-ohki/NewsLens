# Supabase Migrations (NewsLens)

This folder contains SQL migration files for Supabase / Postgres that are used to create the minimal database structure for NewsLens.

Files:
- `db/migrations/001_create_analysis_result.sql` — creates `analysis_result` table
- `db/migrations/002_create_article.sql` — creates `article` table (for article extraction storage)

Pre-requisites:
- A Supabase project or a Postgres database
- Environment variables prepared for connection (examples below)

Apply the migrations using the supabase CLI or `psql`.

Supabase CLI (recommended):
1. Install `supabase` CLI: https://supabase.com/docs/guides/cli
2. Authenticate and set the project
3. Run `supabase db push` or use `supabase db remote set` and then `supabase db push` to apply migrations

Using psql (generic Postgres):
```bash
# Example using PSQL
PGCONN="postgresql://<user>:<pass>@<host>:5432/<db_name>"
psql "$PGCONN" -f db/migrations/001_create_analysis_result.sql
psql "$PGCONN" -f db/migrations/002_create_article.sql
```

Tips:
- By default we use `gen_random_uuid()` for `id` (pgcrypto extension). If your Postgres lacks `pgcrypto`, enable `uuid-ossp` and use `uuid_generate_v4()` instead.
- Tables created here are minimal; adjust column sizes or add RLS/permissions if you plan to use `SUPABASE_ANON_KEY` on clients.
