# Supabase — docs assistant logs

Backend-tools uses Supabase **only** for `agent_search_logs` (search history + thumbs up/down). It is not the main LinkShift database.

Use **two Supabase projects** (free tier allows 2): one for local/dev, one for production.

## Migracje? (ważne)

**W tym repo nie ma `npm run migrate`, Prisma ani Supabase CLI dla tej bazy.**

| Główny backend (`backend/`) | Docs assistant (`backend-tools/supabase/`) |
|----------------------------|--------------------------------------------|
| `prisma migrate` na Postgres | **Brak** automatycznych migracji |
| Schema w `backend/prisma/` | Jeden plik DDL: `agent_search_logs.sql` |

**„Migracja” = uruchomienie SQL w Supabase Dashboard** (albo własny skrypt/CLI poza repo):

1. Wejdź w projekt (dev albo prod).
2. **SQL Editor** → wklej `agent_search_logs.sql` → **Run**.

To robisz **raz na projekt** przy zakładaniu. Przy zmianie schematu później — nowy plik SQL (np. `migrations/002_add_foo.sql`) i znowu **Run** na dev, potem na prod.

Nic nie startuje się razem z `npm run start:dev` — backend-tools tylko **INSERT/UPDATE** do już istniejącej tabeli.

Opcjonalnie możesz użyć [Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase db push`) u siebie; **nie jest to skonfigurowane w LinkShift** — źródłem prawdy w git jest plik `.sql` w tym folderze.

## 1. Create projects

In [Supabase Dashboard](https://supabase.com/dashboard):

| Project | Purpose | Example name |
|---------|---------|----------------|
| A | Local / dev | `linkshift-docs-assistant-dev` |
| B | Production | `linkshift-docs-assistant-prod` |

You do not run Postgres locally — both are hosted Supabase databases.

## 2. Apply schema (each project once)

For **each** project:

1. Open **SQL Editor** → **New query**.
2. Paste the full contents of [`agent_search_logs.sql`](./agent_search_logs.sql).
3. Run.

Verify in **Table Editor**: table `agent_search_logs` exists.

There is no Prisma migration and no CI step for this DDL. After schema changes, run the updated SQL manually on **both** projects (or add a new migration file and document the delta).

## 3. API keys

Per project: **Project Settings** → **API**.

| Setting | Use in backend-tools |
|---------|----------------------|
| **Project URL** | `SUPABASE_URL` |
| **service_role** secret | `SUPABASE_SERVICE_ROLE_KEY` |

Use the **service role** key only on the server (backend-tools). Never expose it in the frontend or commit it to git.

## 4. Wire environment

### Local (`backend-tools/.env`)

From the **dev** project:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Also required for search: `OPENAI_API_KEY`. Optional: `TURNSTILE_SKIP_VERIFY=true` while testing without Turnstile.

Restart backend-tools after changing `.env`:

```bash
cd backend-tools
npm run start:dev
```

### Production

From the **prod** project, set the same two variables where `backend-tools` runs:

- GitHub Actions secret **`STACK_ENV`** (deploy tools app), and/or
- Your `deploy/stack.env` used for Swarm.

`docker-stack.tools.app.yml` does not list these keys today — they must be present in the env file passed to the stack (same pattern as `OPENAI_API_KEY`).

Redeploy the tools app stack after updating secrets.

## 5. Smoke test

1. `POST http://localhost:3030/api/v1/public/docs/search` with body `{ "question": "What is a redirect rule?" }` and header `x-turnstile-token` (or `TURNSTILE_SKIP_VERIFY=true` locally).
2. Response should include `"logId": "<uuid>"` (not `null`).
3. In Supabase **dev** project → **Table Editor** → `agent_search_logs` → new row.
4. `POST .../docs/rate` with `{ "logId": "<uuid>", "rating": 1 }` → `success: true`; row `rating` updates.

If `logId` is `null`, check backend-tools logs for `Supabase is not configured` or insert errors. Search still works without Supabase; only logging and ratings are disabled.

## 6. Day-to-day workflow

| Action | What to do |
|--------|------------|
| New developer machine | Create dev project or share dev URL/key via secrets manager; copy into `backend-tools/.env` |
| Schema change | Edit `agent_search_logs.sql` (or add `migrations/002_....sql`); run SQL on **dev**, test, then run on **prod** |
| Prod analytics | Supabase dashboard on **prod** project only |
| Local experiments | Never point local `.env` at **prod** keys |

## Related

- Env template: `backend-tools/.env.example`
- App behavior: `agents/docs-assistant/README.md`
- DDL: [`agent_search_logs.sql`](./agent_search_logs.sql)
