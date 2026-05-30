# Prompt: Persona stress fixer — pass 2 (target ≥ 9.5)

Use **after** re-audit shows stress score **&lt; 9.5** with Diataxis mixed count blocking the formula.

**Mode:** edit docs + `npm run docs:sync`. Read-only for generated files and dashboard map.

## Goal

Raise persona stress score from **~9.0 → ≥ 9.5** by:

1. Reducing Diataxis **mixed/mismatch** pages from **4 → ≤ 2** (primary formula lever)
2. Flipping **P2 Raj** from `done with friction` → `done` (inline API key steps; no required hop to org guide)

## Context

Re-audit: `.cursor/work/docs-persona-stress-audit.md` § Re-audit (post-fixer).  
Formula: `(JSR/10)×0.40 + dead_ends + contradictions + (10 − diataxis×1.5)×0.15 + blocked`.  
With **4 mixed** pages: max composite ≈ **9.1**. Need **≤ 2 mixed** for **≥ 9.5**.

## Fixes (execute in order)

### D-001 — `overview.md` hub clarity

**File:** `shared/docs/pages/overview.md`

At top after intro, add one sentence: this page is the docs **hub** — tutorial steps first, map below for lookup.

Split mental modes with explicit H2 labels (rename only if needed, minimal):

- Keep **Your first redirect in 5 minutes** as the **Tutorial** entry (dashboard + API blocks unchanged)
- Rename or prefix **Documentation map** intro: "Use this **index** when you know what you need" (reference-style hub)

Ensure **Start here** table stays; no content removal.

### D-002 — `what-is-linkshift.md` explanation vs practice

**File:** `shared/docs/pages/intro/what-is-linkshift.md`

Move or trim inline JSON "practice" snippets that mix tutorial into explanation. Replace with links:

- "Your first redirect" → `overview.md` (dashboard + API sections)
- Keep conceptual prose and reader table

Goal: page reads as **Explanation** only (`type fit: good`).

### D-003 — `redirect-rules.md` index clarity

**File:** `shared/docs/pages/guides/redirect-rules.md`

Add one line under H1: "This page is a **guide index** — pick a linked guide for your task; use the reading order below for conditionals."

Move **Recommended reading order** above the guides table (if below) so index + order are one coherent **how-to hub** (`type fit: good`).

### D-004 — `redirect-rules-core.md` split explanation vs reference

**File:** `shared/docs/pages/guides/redirect-rules-core.md`

Add two top-level H2 sections without rewriting body:

1. **How matching works** — move/keep conceptual intro, routing flow, rate limits, propagation (from S-008)
2. **Rule fields reference** — move field catalog, validation tables, source types here

If content already flows, add the two H2 headers and one-line intros only — surgical restructure, not full rewrite.

Goal: primary type **Explanation** with reference subsection (`type fit: good`, not mixed).

### P2-001 — Inline API key steps (remove friction hop)

**File:** `shared/docs/pages/guides/getting-started.md`

In **Create an API key** and **API automation checklist** step 1:

- Include full numbered UI steps inline (sidebar **Organization** → **Manage API keys**, **Create API key**, copy secret) — same facts as org dashboard guide
- Add one line: "One-time setup (~2 minutes); the rest of the checklist stays in API docs below."
- Checklist step 1 should not *require* opening org guide for Raj to succeed — link remains optional "more detail"

## After edits

1. `npm run docs:sync` until green
2. Grep `shared/docs/pages/` for `frontend/`, `backend/`, `shared/not-public/` — zero
3. Append to `.cursor/work/docs-persona-stress-audit.md`:

```markdown
## Fixer pass 2 (Diataxis + P2, target ≥ 9.5)

> Date: YYYY-MM-DD

| ID | Status | Files | Note |
|----|--------|-------|------|
```

## Boundaries

- Follow `UX_WRITING.md`
- No new pages unless absolutely required (prefer hub cleanup)
- No invented API behavior

## Output in chat

- D-001–D-004, P2-001 status
- Expected Diataxis mixed count after edits (your estimate)
- Files edited, docs:sync status
