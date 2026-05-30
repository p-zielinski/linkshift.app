# Prompt: Final documentation verification (target ≥ 9.8/10)

Use **after** prior passes (`docs-gap-closer-fixer.md`, `docs-final-verification-97.md`) when the bar is raised to **9.8**.

**Mode:** read + **edit in place** + create pages only if a core capability is still undocumented. Run `npm run docs:sync`.

## Role

You are a **strict principal reviewer** simulating the LinkShift **Ask docs** assistant: a user must get a correct, complete answer from public docs alone for any normal task (dashboard, Management API, public tools, account, billing).

**Pass criterion:** honest overall score **≥ 9.8/10**. **Every** capability matrix row and **every** rubric criterion must score **≥ 9.8**. If any row or criterion is below 9.8 after fixes, report the exact deficit — do not round up.

## Inputs

1. `.cursor/work/full-docs-audit-findings.md` (all prior passes)
2. `shared/docs/manifest.yaml` + every `shared/docs/pages/**/*.md`
3. `shared/docs/openapi/linkshift-api-keys.openapi.yaml`
4. `agents/docs-assistant/dashboard-map/DASHBOARD_MAP.md`
5. `UX_WRITING.md`, `AI_CONTEXT.md`

## Scoring rubric (9.8 bar)

| Criterion | Weight | 9.8 requires |
|-----------|--------|--------------|
| **Coverage** | 30% | Every capability matrix row has a primary doc with **task-complete** steps (not pointer-only); auth, billing, CRUD, tools fully covered |
| **Dual-path** | 25% | CRUD with UI+API: **both clear** on both sides with explicit cross-links and cited `METHOD /path`; auth/billing/tools single-path but cross-linked from both entry points |
| **Accuracy** | 25% | Labels match map/templates; every cited API path exists in OpenAPI; zero internal repo paths; UI pagination limits and wizard button labels match map |
| **Discoverability** | 10% | `overview.md` map lists **all** guide categories including dashboard, account, billing, public tools; hubs link children; FAQ/index rows complete |
| **Ask-docs readiness** | 10% | 10 spot-check questions answerable in ≤2 hops from `/docs` with **actionable** steps (not “see overview”) |

**Per-row minimum for 9.8 claim:** capability score **≥ 9.8** — no exceptions unless explicitly N/A with documented reason.

### What separates 9.7 from 9.8

| Area | 9.7 (pass) | 9.8 (this pass) |
|------|------------|-----------------|
| Auth/billing | Dedicated guides exist | Guides include **numbered UI steps**, error/edge cases, and cross-links from API entry points |
| CRUD dual-path | H2 exists on both sides | **Automate instead** lists all relevant `METHOD /path`; **In the dashboard** names sidebar labels and primary buttons |
| Dashboard smoke path | Steps documented | **Next in the dashboard** chain links group → host → rule → test without gaps |
| Public tools | Page exists | Rate limits, single-hop trace, SSRF guard behavior stated factually |
| Manifest | 1:1 with disk | Every `description` matches H1 + first paragraph within one sentence |
| Thin rows (9.5–9.7) | Acceptable at 9.5+ | Must be raised to **≥ 9.8** with surgical edits |

## Spot-check questions (must be answerable with actionable steps)

Answer from docs only; if any fails or answer is pointer-only, fix docs and re-check:

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
2. Score each row, each rubric criterion, and overall — **harsher than 9.7 pass**.
3. For **any** row &lt; 9.8, rubric criterion &lt; 9.8, or failed spot-check: **edit** the right file immediately (surgical, 2–8 sentences or a short numbered list).
4. Verify manifest: every markdown guide on disk has an entry; descriptions match H1 + intro.
5. Run `npm run docs:sync` from repo root until green (includes links check).
6. Re-score after fixes. Loop edit → sync → re-score until all rows ≥ 9.8 or you hit a **product-owned blocker** (document it honestly).
7. Append to `.cursor/work/full-docs-audit-findings.md`:

```markdown
## Final verification (9.8 target)

> Date: YYYY-MM-DD
> Overall score: X.X / 10
> Pass: yes / no (≥ 9.8, all rows ≥ 9.8)

### Rubric (weighted)
| Criterion | Weight | Score | Notes |

### Capability matrix (9.8 re-score)
(full table — all rows)

**Rows below 9.8:** (table or "none")

### Spot-check results
| # | Question | Answerable? | Doc path |

### manifest ↔ disk
(count + 1:1 confirmation)

### Files edited this pass
(bullets)

### docs:sync
green / failed

### Deficits if Pass: no
(numbered list, max 8 items, with file + fix)
```

## Fix priorities (if below 9.8)

1. Blockers: wrong API path, missing auth/billing/tools guide, broken links
2. Majors: missing dual-path paragraph, thin pointer-only auth/billing rows, incomplete dashboard smoke chain
3. Minors: manifest description drift, missing pagination notes, Automate instead missing explicit paths
4. Do not pad with fluff — add cross-links, numbered UI steps, and 2–6 sentence task blocks

## Boundaries

- No invented Paddle pricing, retention days, or rate limits — quote UI or say “depends on your plan.”
- No new engine concept pages — link existing concepts.
- Max **one** new page this pass only if matrix shows unexplained `missing` for a core capability.
- Do not edit `agents/docs-assistant/dashboard-map/` or generated files by hand.

## Output in chat

1. **Overall score** X.X / 10 and **Pass: yes/no** (≥ 9.8, all rows ≥ 9.8)
2. Rubric table with each criterion score
3. Compact capability matrix (only rows &lt; 9.8 or changed from prior 9.7 pass)
4. Spot-check table summary
5. Files edited
6. If Pass: no — numbered list to reach 9.8 (max 8 items)

## Self-check

- [ ] All 10 spot-checks pass from docs alone with actionable steps
- [ ] **Every** capability row ≥ 9.8
- [ ] **Every** rubric criterion ≥ 9.8
- [ ] No `frontend/` or `backend/` paths in `shared/docs/pages/`
- [ ] manifest ↔ disk 1:1 for guides
- [ ] `npm run docs:sync` green
- [ ] Findings file updated with Final verification (9.8 target) section
- [ ] Score is honest (do not claim 9.8 if any row is pointer-only or dual-path is one-sided)
