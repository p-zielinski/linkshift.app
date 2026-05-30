# Docs assistant — token cost in Supabase logs

> Last updated: 2026-05-30
> Status: done (pending Supabase migration on dev/prod)

## Problem & goal

Track OpenAI token usage per docs search and persist estimated USD cost in `agent_search_logs` for analytics.

## Key files

| Area | Path |
|------|------|
| Service wiring | `backend-tools/src/docs-assistant/docs-assistant.service.ts` |
| Cost math | `backend-tools/src/docs-assistant/docs-assistant-token-cost.util.ts` |
| Usage accumulator | `backend-tools/src/docs-assistant/docs-assistant-llm-usage-tracker.ts` |
| DDL (new installs) | `backend-tools/supabase/agent_search_logs.sql` |
| DDL (existing DB) | `backend-tools/supabase/migrations/002_llm_token_usage.sql` |

## Verification

- `npm test docs-assistant-token-cost.util.spec.ts` in `backend-tools`
- Run migration SQL on Supabase dev, then smoke search → row has `llm_*` columns populated
