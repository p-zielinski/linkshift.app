# Prompt: OpenAPI integrator experience audit + fix (pass 2)

**Independent of** `docs-openapi-contract-audit.md` (pass 1). Do **not** re-run the same controller/Zod matrix as your primary score — assume pass 1 improved fidelity. This pass optimizes **developer experience** reading `/docs/api/:operationId` and Try me.

**Mode:** read + **edit** `shared/docs/openapi/linkshift-api-keys.openapi.yaml` + `npm run docs:sync`.

## Role

You are a **principal API technical writer** reviewing OpenAPI **descriptions** for integrators who have an API key and need to ship automation without reading backend source.

**Pass criterion:** honest overall score **≥ 9.5/10**. Every operation **≥ 9.0** on integrator-usefulness.

## Question this pass answers

> *Can a competent developer understand when to call each operation, what to send, what comes back, and what to do on failure — from OpenAPI text alone?*

## Inputs

1. `shared/docs/openapi/linkshift-api-keys.openapi.yaml` (including pass 1 edits)
2. `shared/docs/pages/guides/getting-started.md`, `redirect-rules-core.md`, `redirect-rules-operations.md`, `link-map-entries.md`, `domains-and-groups.md` — align terminology only; **do not edit markdown**
3. `UX_WRITING.md`
4. `.cursor/work/openapi-audit-findings.md` — read pass 1; append pass 2

## Method (different from pass 1)

### Phase A — Integrator personas (simulate reading spec)

| ID | Persona | Task | Must be clear from OpenAPI |
|----|---------|------|----------------------------|
| I1 | CI engineer | Create rule + simulate + redirect test | Prerequisites, idempotency hints, simulate vs live |
| I2 | Data importer | Bulk import 500 link map entries + rollback | Import limits, failure shape, bulk delete |
| I3 | SRE | Usage limits + analytics window | GET usage fields meaning; analytics params vs dashboard |
| I4 | New integrator | First POST chain | info.description + tag descriptions orient reader |

Log **friction moments** (thin summary, missing prerequisite, unclear error, jargon without definition).

### Phase B — Description quality rubric (per operation)

Score each `operationId` on:

| Dimension | 9.5 bar |
|-----------|---------|
| **Summary** | Verb + object; ≤ 80 chars; not generic "Returns X" |
| **Description** | When to use, prerequisites, side effects, pagination/export notes |
| **Parameters** | Non-obvious query params explained (not just restated name) |
| **Request body** | Top-level schema `description` + critical property hints |
| **Responses** | 400/404/409 descriptions say *why* when non-obvious |
| **Discoverability** | Tag + info text helps choose right operation |

**Thin example (score ≤ 7):** `description: Returns organization details for the authenticated organization context.`

**Strong example (score ≥ 9):** states scope, fields of note, link to usage endpoint, 402 when plan blocks API.

### Phase C — Cross-cutting improvements

1. **`info.description`** — onboarding paragraph: auth header, 402/429 handling, dashboard-only surfaces, pointer to markdown guides by name (plain English, no repo paths).
2. **Tag descriptions** — each tag: typical workflow order (e.g. Domain Groups → Domains/Subdomains → Rules).
3. **Shared responses** (`Unauthorized`, `PaymentRequired`, `TooManyRequests`, `BadRequest`) — ensure descriptions give recovery action.
4. **Schema component descriptions** — key entities (`RedirectRule`, `DomainGroup`, `OrganizationUsage`) have 1–2 sentence entity-level description.

## Fixes (edit YAML)

- Expand thin operation `summary` / `description` fields (pass 1 may have fixed accuracy; you fix **usefulness**).
- Add `description` on parameters and schemas still lacking integrator context.
- Use markdown in YAML `|` blocks where multi-sentence helps.
- Max ~8 sentences per operation description — dense, not fluffy.
- **Do not** change paths, methods, or schema types unless pass 1 missed a fidelity bug you discover — if so, fix and note in findings.

## Scoring (pass 2 overall)

| Criterion | Weight |
|-----------|--------|
| Persona task clarity (I1–I4) | 30% |
| Operation description quality (avg of 41 ops) | 40% |
| info/tags/shared components | 15% |
| Error/recovery guidance | 15% |

**Pass:** overall ≥ 9.5 and no persona **blocked** on OpenAPI text alone.

## After fixes

1. `npm run docs:sync` until green.
2. Append to `.cursor/work/openapi-audit-findings.md`:

```markdown
## Pass 2 — Integrator experience

> Date: YYYY-MM-DD
> Overall score: X.X / 10
> Pass: yes / no (≥ 9.5)

### Persona results
| ID | Outcome | Friction notes |

### Operations improved (count)
N operations expanded; list operationIds with largest delta

### Operations still below 9.0
(table or none)

### Comparison with pass 1
(confirm fidelity preserved; UX delta)

### docs:sync
green / failed
```

Update pass table at top of findings file.

## Output in chat

1. Overall score, Pass yes/no
2. Persona I1–I4 outcomes
3. Count of operations improved
4. Top 3 remaining gaps if below 9.5

## Self-check

- [ ] All 41 operations scored on integrator rubric
- [ ] I1–I4 simulated from spec text
- [ ] UX_WRITING.md followed
- [ ] No repo paths in OpenAPI strings
- [ ] docs:sync green
- [ ] Findings file updated

## Boundaries

- No invented rate limit numbers beyond what's already in spec or `info` (plan-based 429 stays qualitative).
- No billing endpoints — out of scope for this spec.
- Do not edit markdown guides this pass.
