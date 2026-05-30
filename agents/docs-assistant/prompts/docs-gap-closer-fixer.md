# Prompt: Documentation gap closer (9.4 → 9.5+)

Use **after** the three-pass full audit (`docs-full-audit-critic` → `docs-full-audit-fixer` → `docs-full-audit-critic-fix`).

Current state is documented in `.cursor/work/full-docs-audit-findings.md` — overall **9.4/10**. This pass **creates missing guides** and wires discovery so auth, billing, and public tools are no longer “pointer-only.”

**Mode:** edit `shared/docs/`, `manifest.yaml`; run `npm run docs:sync`.

## Role

You are a **technical writer** closing the last product gaps from the audit’s **What still blocks 9.5** table. You write factual, task-oriented docs — no invented API fields, no fake Paddle prices, no screenshots.

## Inputs

1. `.cursor/work/full-docs-audit-findings.md` — § **What still blocks 9.5** and capability matrix rows &lt; 9.5
2. `agents/docs-assistant/dashboard-map/DASHBOARD_MAP.md` — UI labels for dashboard/billing/profile/org
3. `UX_WRITING.md`
4. `AI_CONTEXT.md` — public tools endpoints, architecture boundaries
5. `shared/docs/openapi/linkshift-api-keys.openapi.yaml` — cite only real Management API paths
6. Spot-check when needed:
   - Auth: `frontend/src/app/features/auth/*.component.html`
   - Billing: `frontend/src/app/features/dashboard/dashboard-page.component.html`, `billing/upgrade-dialog/*`
   - Public tools: `backend-tools/src/api/public-tools.controller.ts` (for path/method only — do not paste backend paths in user docs)

## Deliverables (required)

Create **three new guides** and register them in `manifest.yaml`. Routes follow existing flat pattern: `/docs/guides/<slug>`.

### 1. `account-and-access.md`

**Slug:** `account-and-access`  
**Route:** `/docs/guides/account-and-access`  
**Category:** `guide`

**Minimum content:**

| Topic | Source | Notes |
|-------|--------|-------|
| Sign in / register | `/auth` — tabs **Sign in** / **Register**; fields Email, Password, optional Organization name | Not behind dashboard shell |
| Email verification | `/verify-email`; **Profile** → **Resend verification email** | Link to [Dashboard overview](./dashboard/dashboard-overview.md) § Profile |
| Password reset | `/reset-password` — Email, New password, Confirm password | No in-dashboard password change |
| Accept invite | `/invite` — invite flow copy from templates | Link to [Organization in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) |
| Legal consent gate | `/legal/consent` — **Review updated terms**, **Continue** | `legalConsentGuard` blocks shell until done; map cross-link |
| Session end | Sidebar **Log out** → `/auth` | Brief |

**Sections to include:** Before you start · Sign in or register · Verify your email · Reset your password · Accept an invitation · Legal consent · Related (dashboard overview, getting-started for API keys only).

**Do not** document Management API for login (there is none in OpenAPI). Optional one line: programmatic access starts after sign-in — [Getting started](./getting-started.md).

### 2. `billing-and-plans-in-dashboard.md`

**Slug:** `billing-and-plans-in-dashboard`  
**Route:** `/docs/guides/billing-and-plans-in-dashboard`  
**Category:** `guide`

**Minimum content (UI-only, soft on numbers):**

| Topic | Map / UI |
|-------|----------|
| Where to see usage | `/dashboard` — subscription snapshot, limit cards, **Limit reached**, **Upgrade plan to increase this limit.** |
| Upgrade | **Upgrade** → dialog title **Change your subscription** |
| Manage / cancel | **Manage subscription**, **Cancel subscription** → confirm **Cancel subscription** → Paddle portal |
| Plan note | When plan is `FREE` / `UNMETERED` — describe behavior qualitatively from map (no invented dollar amounts) |
| No Management API | Explicit: billing is not in `linkshift-api-keys` OpenAPI; usage quotas appear on dashboard and in `GET /api/v1/organization/usage` where documented |

Link to [Dashboard overview](./dashboard/dashboard-overview.md) for meters; defer engine limits to [Domains and groups](./domains-and-groups.md) usage section.

### 3. `public-tools-api.md`

**Slug:** `public-tools-api`  
**Route:** `/docs/guides/public-tools-api`  
**Category:** `guide`

**Minimum content:**

| Topic | Source |
|-------|--------|
| What they are | QR + redirect trace; separate from Management API |
| Endpoints | `GET /api/v1/public/qr-code`, `GET /api/v1/public/trace` (and alias `GET /trace` if documented in AI_CONTEXT) |
| Single-hop trace | One call = one hop; UI chains client-side |
| Security | SSRF guard, hop limits — high level from `AI_CONTEXT.md`, no internal file paths |
| Dashboard | **In the dashboard** → [Tools in the dashboard](./dashboard/tools-in-dashboard.md) |
| Marketing URLs | `/qr-code-generator`, `/redirect-tester` when not signed in |

Do not invent rate-limit numbers unless copied from env example comments or published user copy — otherwise “rate limits apply” + link support.

## Discovery wiring (edit existing pages)

After creating the three files, update:

| File | Change |
|------|--------|
| `shared/docs/pages/overview.md` | Documentation map: add **Account & access**, **Billing (dashboard)**, **Public tools API** |
| `shared/docs/pages/intro/what-is-linkshift.md` | Reader row or bullet for account admin → new slugs |
| `shared/docs/pages/guides/faq.md` | Index links if missing |
| `shared/docs/pages/guides/dashboard/dashboard-overview.md` | Replace thin Account access / billing pointers with links to new guides |
| `shared/docs/pages/overview-faq.md` | Cross-link public-tools guide where trace/QR mentioned |

## manifest.yaml

Add three entries with `category: guide`, accurate `description` (one line, matches intro), `source`, `route`.

## Style

- `UX_WRITING.md`: American English, you/your, sentence case H2, bold exact UI strings.
- Relative links: `../` to parent guides, `./dashboard/...` from `guides/`.
- No `frontend/`, `backend/`, `shared/docs-summaries/` in user prose.

## Workflow

1. Read findings **What still blocks 9.5**.
2. Create the three markdown files.
3. Update discovery pages + dashboard-overview.
4. Update `manifest.yaml`.
5. Run `npm run docs:sync` until green.
6. Append to `.cursor/work/full-docs-audit-findings.md`:

```markdown
## Gap closer pass

> Date: YYYY-MM-DD
> Estimated score after pass: X.X / 10

| Deliverable | Status |
|-------------|--------|
| account-and-access.md | created / updated |
| billing-and-plans-in-dashboard.md | created / updated |
| public-tools-api.md | created / updated |
| Discovery wiring | done |
| docs:sync | green / failed |

### Files touched
(bullets)
```

## Output in chat

1. List of new files + edited files
2. manifest snippets added
3. `docs:sync` result
4. Estimated score (honest, vs 9.5 target)
5. What to run next: `docs-final-verification-97.md`

## Rules

- Do not hand-edit `documentation.generated.ts` or `shared/docs-summaries/`.
- Do not duplicate full redirect-engine guides.
- If a UI string is uncertain, read the template; mark nothing as `(verify)` in public docs — either confirm or omit.

## Self-check

- [ ] Three new slugs in manifest and on disk
- [ ] `overview.md` documentation map lists all dashboard guides + three new guides
- [ ] Auth guide covers `/auth`, `/verify-email`, `/reset-password`, `/invite`, `/legal/consent`
- [ ] Billing guide states no Management API for Paddle
- [ ] Public tools guide cites only endpoints from AI_CONTEXT / controller
- [ ] `npm run docs:sync` passed
