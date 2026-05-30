# Prompt: OpenAPI contract fidelity audit + fix (pass 1)

**Independent of** markdown docs audits and `docs-openapi-integrator-audit.md`.

**Mode:** read backend + **edit** `shared/docs/openapi/linkshift-api-keys.openapi.yaml` + `npm run docs:sync`.

**Do not** edit `shared/docs/openapi/by-tag/`, `frontend/.../documentation.generated.ts`, or backend code.

## Role

You are a **contract fidelity auditor** for the LinkShift Management API OpenAPI spec. Your job is to verify the YAML is **truthful against the running backend** — paths, methods, parameters, status codes, schema constraints, and descriptions of **behavior** (not marketing copy).

**Pass criterion:** honest overall score **≥ 9.5/10**. Every operation row **≥ 9.0** unless N/A.

## Question this pass answers

> *If I call the API exactly as the OpenAPI describes, will the backend behave as documented?*

## Inputs (read in order)

| Priority | Path | Use |
|----------|------|-----|
| 1 | `shared/docs/openapi/linkshift-api-keys.openapi.yaml` | Spec under audit |
| 2 | `backend/src/api/*.controller.ts` | Routes, guards, HTTP methods |
| 3 | `backend/src/zod-schames/*.schemas.ts` | Request validation, enums, min/max, required fields |
| 4 | Relevant `backend/src/**/*.service.ts` | Business rules (soft delete, 409, pagination, analytics windows) |
| 5 | `shared/docs/pages/guides/*.md` | Cross-check prose claims already in guides (do not edit guides this pass) |
| 6 | `.cursor/work/openapi-audit-findings.md` | Append results |

Spot-check controllers for: `organization`, `domain-groups`, `domains`, `subdomains`, `redirect-rules`, `redirect-tests`, `link-maps`, `link-map-entries`.

## Task inventory

Build an **operation matrix** — one row per `operationId` (41 operations). Columns:

| Column | Check |
|--------|-------|
| Path + method | Matches controller route prefix `/api/v1/...` |
| Auth | API-key accessible (exclude dashboard-only routes — spec must not list them) |
| Request schema | Fields, required, enums, min/max match Zod |
| Query/path params | Names, required, defaults match controller |
| Response codes | 200/400/401/402/404/409/429 present when backend returns them |
| Behavior description | Accurate (soft delete, cursor pagination, simulate semantics, import limits) |
| Score 0–10 | Holistic contract truth |
| Evidence | controller + schema file refs (internal OK in findings) |

Also verify `info`, `tags`, `components/schemas`, `components/responses`.

## Verification rules

1. **No invented endpoints** — every path in spec must exist on API-key controllers; no missing public operations.
2. **Constraints from Zod** — `minLength`, `maxLength`, `enum`, `maxItems`, array bounds must match (e.g. import 500 rows, simulate 100 entries, bulk delete 1000).
3. **Status codes** — if service throws `ConflictException`, spec should document 409; `NotFoundException` → 404; validation → 400.
4. **Pagination** — list endpoints: document cursor fields (`startAfterId`, `limit` defaults) matching service.
5. **Analytics** — `range` enum, UTC hour flooring, 31-day span match backend.
6. **Soft delete** — DELETE descriptions say soft-delete if backend soft-deletes.
7. **Descriptions** — fix **wrong** or **misleading** behavior text; expand **empty/thin** operation descriptions that omit critical constraints discoverable in Zod/service (2–6 sentences max per operation).
8. **Schema properties** — add/fix `description` on properties where Zod documents non-obvious rules (regex source, linkMapId/destination exclusivity, robotsPolicy enum).
9. **UX_WRITING.md** — American English, sentence case summaries, no "please", active voice in new prose.
10. **No internal repo paths** in user-visible OpenAPI strings.

## Scoring rubric (pass 1)

| Criterion | Weight | 9.5 requires |
|-----------|--------|--------------|
| Path/method coverage | 25% | 100% match controllers; no phantom ops |
| Schema fidelity | 30% | Required/enums/limits match Zod |
| Response codes | 20% | Documented codes match real failures |
| Behavior descriptions | 25% | Accurate; critical constraints stated |

**Overall** = weighted average. **Per-operation minimum for 9.5 claim:** ≥ 9.0 unless documented N/A.

## Fix priorities

1. **Blockers:** wrong path/method, wrong required fields, missing 402/409, wrong enum
2. **Majors:** wrong limits (500 vs 1000), missing pagination docs, inaccurate simulate/analytics behavior
3. **Minors:** thin one-line descriptions, missing property descriptions on request bodies

Edit **only** `linkshift-api-keys.openapi.yaml`. Surgical YAML edits — preserve formatting style.

## After fixes

1. `npm run docs:sync` from repo root until green.
2. Append to `.cursor/work/openapi-audit-findings.md`:

```markdown
## Pass 1 — Contract fidelity

> Date: YYYY-MM-DD
> Overall score: X.X / 10
> Pass: yes / no (≥ 9.5)

### Operation matrix (summary)
| operationId | Score | Fixed? | Note |

### Rows below 9.0
(none or table)

### Files edited
- shared/docs/openapi/linkshift-api-keys.openapi.yaml

### docs:sync
green / failed
```

Update pass table at top of findings file.

## Output in chat

1. Overall score and Pass yes/no
2. Count of blockers/majors fixed
3. Top 5 remaining gaps (if any)
4. Operation rows still below 9.0 (if any)

## Self-check

- [ ] All 41 operationIds in matrix
- [ ] Zod spot-checks for write operations
- [ ] No edits outside openapi YAML + findings + sync side effects
- [ ] docs:sync green
- [ ] Score honest
