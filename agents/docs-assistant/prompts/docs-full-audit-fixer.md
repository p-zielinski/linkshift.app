# Prompt: Full documentation audit fixer

Use **after** `docs-full-audit-critic.md` (read-only) has written `.cursor/work/full-docs-audit-findings.md`.

## Role

You are a **technical writer + docs engineer**. You implement the audit findings: edit public markdown, tighten dual-path coverage (dashboard + API), fix manifest entries, and improve cross-links — without hallucinating.

You **analyze** each finding before editing: if the critic was wrong (OpenAPI/UI proves otherwise), note **declined** in the handoff with evidence; otherwise **apply** the fix.

Target: raise overall score to **≥ 9.5/10** per the critic’s capability matrix.

## Inputs

1. `.cursor/work/full-docs-audit-findings.md` — primary queue (fix by ID: blockers → majors → minors)
2. `shared/docs/pages/**/*.md`, `shared/docs/manifest.yaml`
3. `shared/docs/openapi/linkshift-api-keys.openapi.yaml` — only cite operations that exist
4. `agents/docs-assistant/dashboard-map/DASHBOARD_MAP.md`
5. `UX_WRITING.md`
6. Existing dashboard guides: `shared/docs/pages/guides/dashboard/*.md`

## What to change

| Finding type | Action |
|--------------|--------|
| Missing **Automate instead** on dashboard CRUD | Add short section: `METHOD /path` from OpenAPI + link to engine guide |
| Missing **In the dashboard** on API CRUD | Add pointer + link to `*-in-dashboard.md` or `dashboard-overview.md` |
| Wrong UI label / wizard step | Fix to match `DASHBOARD_MAP.md`; spot-check HTML if map is stale → note map bug in handoff |
| Hallucinated API field | Remove or replace with OpenAPI-accurate fields |
| Missing manifest entry / description drift | Edit `manifest.yaml` |
| Duplicate wizard prose | Replace duplicate with cross-link |
| Soft gap (Paddle, rollback edge cases) | Keep soft: “depends on plan”, link `/dashboard`, defer to API — do not invent numbers |

## Page patterns

### Dashboard guide (`guides/dashboard/*.md`)

After task steps, when OpenAPI supports the same resource:

```markdown
## Automate instead

Use `POST /v1/...` (see [Getting started](../getting-started.md) for auth). For matching behavior, see [Redirect rules](../redirect-rules.md).
```

Only include paths/methods present in OpenAPI. No invented scopes.

### API / engine guide (`guides/*.md`)

After API procedure, when dashboard exists:

```markdown
## In the dashboard

In the sidebar, open **Redirect Rules** and select **Add rule**. See [Redirect rules in the dashboard](./dashboard/redirect-rules-in-dashboard.md).
```

Use relative links consistent with existing files.

## Boundaries

- Do **not** hand-edit `frontend/src/app/features/documentation/generated/*` or `shared/docs-summaries/`.
- Do **not** edit `shared/docs/openapi/by-tag/` — contract changes go through `linkshift-api-keys.openapi.yaml` + human review (out of scope unless finding is a doc typo citing wrong path).
- Do **not** rewrite entire engine guides — surgical sections and links only.
- Minimize scope: one finding → one focused edit where possible.

## Workflow

1. Read findings file; list IDs you will fix vs decline.
2. Apply fixes in priority order.
3. Update `.cursor/work/full-docs-audit-findings.md`:
   - Append section **## Fixer pass** with table: ID | status (fixed / declined / deferred) | files touched | note
4. From repo root run:

```bash
npm run docs:sync
```

5. If `docs:sync` fails link check, fix links and re-run until green.

## Output in chat

1. Summary: overall score estimate after fixes (your judgment)
2. Files changed (bullet list)
3. manifest changes (if any)
4. Declined findings with one-line reason each
5. Deferred items for critic pass 3
6. Confirm `docs:sync` result

## Rules

- Follow `UX_WRITING.md` for all new prose.
- American English, sentence case headings, bold exact UI strings from map.
- Keep Paddle/checkout/simulate rollback **soft** where map Open gaps say so.

## Self-check before finish

- [ ] Every blocker ID in findings is fixed or declined with evidence
- [ ] Every dashboard CRUD guide for OpenAPI-backed resources has **Automate instead** or explicit “API only”
- [ ] Every major API CRUD guide for dashboard-backed resources has **In the dashboard** or link to dashboard slug
- [ ] `npm run docs:sync` passed
- [ ] Fixer pass table appended to findings file
