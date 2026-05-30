# Prompt: Persona stress fixer (S-001–S-008)

Use **after** `docs-persona-stress-critic.md` when the handoff lists findings S-001+.

**Mode:** edit docs in place + `npm run docs:sync`. Do **not** edit generated files or `agents/docs-assistant/dashboard-map/`.

## Role

You are a **documentation journey fixer**. Your job is to reduce persona friction identified in `.cursor/work/docs-persona-stress-audit.md` — not to re-run the capability matrix audit.

**Goal:** After your pass, a re-run of the persona stress critic should score **≥ 9.5/10** with **≤ 1** journey ending `done with friction` and **≤ 2** Diataxis mixed pages (unchanged count OK if journeys improve).

## Inputs

1. `.cursor/work/docs-persona-stress-audit.md` — findings S-001 through S-008 and fix queue
2. `UX_WRITING.md` — tone for all new prose
3. Target files listed per finding below

## Fix queue (execute in order)

### S-001 — Invite / first-day hub signpost

**Files:** `shared/docs/pages/overview.md`, `shared/docs/pages/guides/faq.md`

- In `overview.md` § **Start here** table: add a row **Invited to a team?** → link to [Account and access](./guides/account-and-access.md) § Accept an invitation (use anchor if heading exists).
- In `faq.md` **Where to look** (or top index table): add row for invites / account access pointing to same section.

### S-002 — API automation checklist

**File:** `shared/docs/pages/guides/getting-started.md`

Add H2 **API automation checklist** (after Create an API key or before Related) with numbered steps:

1. Create API key in dashboard — link to `organization-and-api-keys-in-dashboard.md`
2. `POST /api/v1/domain-groups` — anchor to `domains-and-groups.md`
3. `POST /api/v1/subdomains` or `POST /api/v1/domains` — same guide
4. `POST /api/v1/redirect-rules` — link to `redirect-rules-core.md` or overview API block
5. `POST /api/v1/redirect-rules/simulate` — link to `redirect-rules-operations.md`

One sentence: keys are dashboard-only; steps 2–5 are Management API. No invented JSON — anchors only.

### S-003 — Conditional routing reading order

**File:** `shared/docs/pages/guides/redirect-rules.md`

Add a short **Recommended reading order** block (before or after the guides table) for dynamic/conditional destinations:

1. [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
2. [Engine — variables](../concepts/redirect-engine-variables.md)
3. [Engine — conditionals](../concepts/redirect-engine-conditionals.md)
4. [Redirect rules — recipes](./redirect-rules-recipes.md)
5. [Redirect rules — matching](./redirect-rules-core.md) (field reference)
6. [Redirect rules — simulate](./redirect-rules-operations.md)

One intro sentence: use this path when destinations use placeholders or conditionals.

### S-004 — De-emphasize engine link in dashboard wizard

**File:** `shared/docs/pages/guides/dashboard/redirect-rules-in-dashboard.md`

In **Create a redirect rule**: remove or soften mid-wizard link to `redirect-engine-variables`. Replace with: static URL is enough for most first rules; dynamic destinations are in **Related** only.

### S-005 — Fastest hostname callout

**File:** `shared/docs/pages/guides/dashboard/domains-and-subdomains-in-dashboard.md`

Add **First redirect?** callout near Domains vs Subdomains: for fastest test, use **Subdomains** → **Add subdomain**; use **Domains** when custom DNS is ready.

### S-006 — Public tools rate-limit clarity

**File:** `shared/docs/pages/guides/public-tools-api.md`

In **Security and limits**, add a factual table from deployment defaults (verify in `backend-tools/.env.example`):

| Endpoint family | Default limit (per IP per minute) | Notes |
|-----------------|-------------------------------------|-------|
| QR (`/api/v1/public/qr-code`) | 600 | Configurable per deployment |
| Trace (`/api/v1/public/trace`, `/trace`) | 240 | Configurable per deployment |

Add: limits require Redis; if Redis is unavailable, rate limiting may be skipped temporarily. Contact support for higher throughput. Do **not** cite `backend-tools/` paths in user prose.

### S-007 — Unblock cross-link

**File:** `shared/docs/pages/guides/account-and-access.md`

In **Accept an invitation**: where prose mentions owner unblock, link to [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) § Members (**Block** / **Unblock**).

### S-008 — Remove internal cache doc link

**Files:** `shared/docs/pages/guides/redirect-rules-core.md` (required); `shared/docs/pages/concepts/link-map-concepts.md` (same pattern if present)

Replace link to `shared/not-public/cache-and-data-layer.md` with 1–2 public-safe sentences: rule changes propagate through the platform cache; expect brief delay before live traffic reflects edits. No internal paths.

## After edits

1. Run `npm run docs:sync` from repo root until green.
2. Confirm no `frontend/`, `backend/`, or `shared/not-public/` paths remain in `shared/docs/pages/`.
3. Append to `.cursor/work/docs-persona-stress-audit.md`:

```markdown
## Fixer pass (persona stress)

> Date: YYYY-MM-DD

| ID | Status | Files | Note |
|----|--------|-------|------|
(S-001 through S-008)

### docs:sync
green / failed
```

## Boundaries

- Surgical edits only — no rewrites of unrelated sections.
- No invented product behavior; verify rate limits against `.env.example` or code.
- Do not change manifest unless a new section requires description drift (unlikely this pass).

## Output in chat

1. Table S-001–S-008 status
2. Files edited
3. docs:sync result
4. Any finding you could not fix honestly (with reason)
