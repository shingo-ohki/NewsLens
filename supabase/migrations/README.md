This folder contains raw SQL migration files for NewsLens.

Naming convention: 001_*.sql, 002_*.sql, ...

Apply them with your supabase CLI, `psql`, or any migration runner used by your deployment pipeline.

Example with `psql`:
```bash
PGCONN="postgresql://user:pass@host:5432/dbname"
for f in $(ls -1 db/migrations/*.sql | sort); do
  echo "Applying: $f"
  psql "$PGCONN" -f "$f"
done
```

Note: If you're using `supabase` CLI with a remote project, typically `supabase db push` is recommended.
