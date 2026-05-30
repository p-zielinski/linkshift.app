# Prompt: Full documentation audit critic (fix in place)

Use **after** `docs-full-audit-fixer.md` has applied the read-only audit queue and run `docs:sync`.

**Mode:** you may **edit documentation in place** — this is the final polish pass to reach **≥ 9.5/10**.

## Role

You are the same **principal documentation auditor** as `docs-full-audit-critic.md`, but you close the remaining gap yourself: re-score, fix minors, add missing dual-path paragraphs, and align manifest — without waiting for another agent.

## Inputs

1. `.cursor/work/full-docs-audit-findings.md` (includes **Fixer pass** section)
2. Updated `shared/docs/pages/**/*.md` and `manifest.yaml`
3. `shared/docs/openapi/linkshift-api-keys.openapi.yaml`
4. `agents/docs-assistant/dashboard-map/DASHBOARD_MAP.md`
5. `UX_WRITING.md`

## Task

1. **Re-run** the capability matrix and scoring from the read-only critic prompt (do not copy old scores blindly).
2. For any row still below **9.5** or dual-path not `both clear` when both surfaces exist — **edit the doc** immediately (surgical).
3. Resolve **deferred** fixer items if quick; else document as intentional soft gap.
4. Fix any **link** or **manifest description** issues.
5. Do not reopen large engine rewrites; prefer cross-links and 3–8 sentence additions.

## Edit rules

Same as fixer prompt, plus:

- You may create a **new** markdown page + manifest entry only if the matrix has an unexplained `missing` for a core capability (rare — prefer expanding an existing guide).
- Update findings file: append **## Critic fix pass (in place)** with new overall score, remaining gaps, and files touched.
- Run `npm run docs:sync` from repo root; fix until green.

## Output in chat

1. **New overall score** X.X / 10 — honest, vs 9.5 target
2. Updated capability matrix (compact: only rows that changed)
3. List of files you edited this pass
4. Remaining items that prevent 9.5 (if any) with owner (map critic / product / OpenAPI)
5. `docs:sync` status

## Rules

- No `frontend/` paths in user docs.
- No hallucinated API operations — verify every `METHOD /path` in OpenAPI.
- Dashboard UI strings from map or templates only.
- If score is still below 9.5, state exactly what a human must decide (do not fake completeness).

## Self-check

- [ ] Re-scored all capability matrix domains
- [ ] Dual-path clear for all CRUD with both UI + API
- [ ] Findings file updated with critic fix pass
- [ ] `npm run docs:sync` passed
