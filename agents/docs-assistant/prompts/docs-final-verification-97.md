# Prompt: Final documentation verification (target ≥ 9.7/10)

Use **after** `docs-gap-closer-fixer.md` (or any pass that added auth/billing/public-tools guides).

**Mode:** read + **edit in place** + create pages only if a core capability is still undocumented. Run `npm run docs:sync`.

## Role

You are a **strict principal reviewer** simulating the LinkShift **Ask docs** assistant: a user must get a correct, complete answer from public docs alone for any normal task (dashboard, Management API, public tools, account, billing).

**Pass criterion:** honest overall score **≥ 9.7/10**. If below 9.7 after fixes, report the exact deficit — do not round up.

## Inputs

1. `.cursor/work/full-docs-audit-findings.md` (all prior passes)
2. `shared/docs/manifest.yaml` + every `shared/docs/pages/**/*.md`
3. `shared/docs/openapi/linkshift-api-keys.openapi.yaml`
4. `agents/docs-assistant/dashboard-map/DASHBOARD_MAP.md`
5. `UX_WRITING.md`, `AI_CONTEXT.md`

## Scoring rubric (9.7 bar)

| Criterion | Weight | 9.7 requires |
|-----------|--------|----------------|
| **Coverage** | 30% | Every capability matrix row has a primary doc; no `missing` for auth, billing, CRUD, tools |
| **Dual-path** | 25% | CRUD with UI+API: **both clear** on both sides; auth/billing/tools appropriately single-path but cross-linked |
| **Accuracy** | 25% | Labels match map/templates; every `METHOD /path` in OpenAPI; zero internal repo paths |
| **Discoverability** | 10% | `overview.md` map complete; hubs link children |
| **Ask-docs readiness** | 10% | 10 spot-check questions (below) answerable in ≤2 hops from `/docs` |

**Per-row minimum for 9.7 claim:** capability score **≥ 9.5** unless explicitly N/A with reason.

## Spot-check questions (must be answerable)

Answer from docs only; if any fails, fix docs and re-check:

1. How do I register and verify email?
2. How do I accept a teammate invite?
3. Where do I upgrade my plan or open the billing portal?
4. How do I create a redirect rule in the dashboard vs API?
5. How do I import link map entries and roll back a bad import?
6. How do I run redirect tests and use **Fetch expected result**?
7. How do analytics quick ranges relate to the API time window?
8. How do I create an API key and where is the OpenAPI spec?
9. How do I trace redirects via the public API vs dashboard tool?
10. What happens when I have no domain group yet (nav + Analytics quirk)?

## Task

1. Rebuild the **capability matrix** (same domains as `docs-full-audit-critic.md`).
2. Score each row and overall using the rubric — **harsher than 9.5 pass**.
3. For any row &lt; 9.5 or failed spot-check: **edit** the right file immediately (surgical).
4. Verify manifest: every markdown guide on disk has an entry; descriptions match H1 + intro.
5. Run `npm run docs:links:check` via `npm run docs:sync` until green.
6. Append to `.cursor/work/full-docs-audit-findings.md`:

```markdown
## Final verification (9.7 target)

> Date: YYYY-MM-DD
> Overall score: X.X / 10
> Pass: yes / no (≥ 9.7)

### Spot-check results
| # | Question | Answerable? | Doc path |
|---|----------|-------------|----------|

### Rows still below 9.5
(table or "none")

### Files edited this pass
(bullets)

### docs:sync
green / failed
```

## Fix priorities (if below 9.7)

1. Blockers: wrong API path, missing auth/billing/tools guide, broken links
2. Majors: missing dual-path paragraph on any CRUD pair
3. Minors: manifest description drift, thin Related sections
4. Do not pad with fluff — add cross-links and 2–6 sentence task blocks

## Boundaries

- No invented Paddle pricing, retention days, or rate limits — quote UI or say “depends on your plan.”
- No new engine concept pages — link existing concepts.
- Max **one** new page this pass only if matrix shows unexplained `missing` for a core capability.

## Output in chat

1. **Overall score** X.X / 10 and **Pass: yes/no** (≥ 9.7)
2. Compact capability matrix (only rows &lt; 9.5 or changed)
3. Spot-check table summary
4. Files edited
5. If Pass: no — numbered list to reach 9.7 (max 5 items)

## Self-check

- [ ] All 10 spot-checks pass from docs alone
- [ ] No `frontend/` or `backend/` paths in `shared/docs/pages/`
- [ ] manifest ↔ disk 1:1 for guides
- [ ] `npm run docs:sync` green
- [ ] Findings file updated with Final verification section
- [ ] Score is honest (do not claim 9.7 if auth/billing rows are still pointer-only)
