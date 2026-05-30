# Prompt: Persona journey stress critic (independent audit)

**Independent of** `docs-full-audit-critic.md` and `docs-final-verification-98.md`.

Do **not** reuse the capability matrix, dual-path rubric, or 9.x weighted scoring from those prompts. This audit answers a different question:

> *Can real people with real intent complete real tasks using only public docs — and do they stay oriented while doing it?*

**Mode:** read-only. Do **not** edit `shared/docs/`, `manifest.yaml`, generated files, or the dashboard map. Write findings to a **new** handoff file only.

---

## Role

You are a **documentation UX researcher** stress-testing LinkShift public docs (`shared/docs/pages/`). You simulate impatient, goal-driven readers — not auditors checking OpenAPI line by line.

Your job is to find where docs **lose people**: wrong doc type for the task, dead ends, prerequisite gaps, contradictory advice, and journeys that require source-code archaeology.

---

## Method (follow in order)

### Phase 1 — Diataxis map (documentation shape)

Classify **every** page in `shared/docs/manifest.yaml` into exactly one primary Diataxis type:

| Type | Purpose | Reader question |
|------|---------|-----------------|
| **Tutorial** | Learning-oriented, end-to-end first success | "Take me through my first X" |
| **How-to** | Task-oriented, assumes basics | "How do I do X?" |
| **Explanation** | Understanding-oriented | "Why does X work this way?" |
| **Reference** | Information-oriented, lookup | "What is the exact shape of X?" |

For each page record:

- **Primary type** (one)
- **Type fit** — `good` \| `mismatch` \| `mixed` (explain in one line if not `good`)
- **Prerequisite clarity** — Does the intro say what you must know/do first? `yes` \| `partial` \| `no`

Flag pages where **type fit = mismatch** or **mixed** — these often cause confusion (e.g. reference prose disguised as tutorial, or how-to buried in explanation).

### Phase 2 — Persona journey simulation

Simulate **six personas**. For each, you have a **concrete goal**, **constraints**, and **starting point** (usually `/docs` or a Google landing on one page).

**Rules for simulation:**

1. You may only use text in `shared/docs/pages/**/*.md` and links between those pages (plus inline OpenAPI operation references on API pages).
2. At each hop, log: **page → section → decision** (why you clicked/read there).
3. Mark moments as:
   - **Clear** — next step obvious
   - **Hesitation** — two plausible paths, no signpost
   - **Stuck** — cannot proceed without guessing or leaving docs
   - **Wrong turn** — docs sent you somewhere that doesn't help the goal
4. Estimate **hops** (page transitions) and **reading burden** (`light` / `medium` / `heavy`).
5. End each journey with: **Outcome** `done` \| `done with friction` \| `blocked` and **JSR** (journey success rate 0–100% for that persona).

#### Personas

| ID | Name | Background | Starting URL | Goal |
|----|------|------------|--------------|------|
| P1 | **Maya** | Marketing ops, never used LinkShift, hates APIs | `/docs` | Create first redirect rule in the **dashboard**, run a test, see if it worked — without reading engine concepts |
| P2 | **Raj** | Backend dev, CI owner | `/docs/guides/getting-started` | Automate: domain group + subdomain + redirect rule + simulate via **Management API** only |
| P3 | **Sam** | Invited editor, account exists elsewhere | Email link to `/invite` (simulate landing on docs via search for "accept invitation") | Accept invite, sign in, confirm org access — no API |
| P4 | **Zoe** | Org owner, billing anxiety | `/docs` search intent: "upgrade plan" | Upgrade plan, find usage limits, open billing portal, understand what has **no API** |
| P5 | **Pat** | Security reviewer | `/docs/guides/public-tools-api` (linked from security questionnaire) | Decide if public trace/QR is safe: hops, SSRF, rate limits, single-hop — enough to sign off |
| P6 | **Alex** | Power user | `/docs/guides/redirect-rules` | Build conditional rule with variables — needs **explanation → how-to → dashboard or API execution** without circular reading |

### Phase 3 — Confusion graph

Build a directed graph from journey logs:

- **Nodes** = doc slugs visited across all personas
- **Edges** = transitions taken (with persona IDs)
- **Dead ends** = pages where ≥2 personas hit **Stuck** or **Wrong turn** with no outbound fix
- **Orphans** = manifest pages never reached by any persona journey (note if that's OK for reference-only)
- **Loops** = A → B → A without progress (bad); note persona and pages

### Phase 4 — Contradiction & consistency scan

Hunt cross-page conflicts **in user-visible prose** (not repo paths):

- Prerequisites disagree (e.g. "create domain first" vs "rule works without host")
- UI labels or button names differ for the same action
- API availability contradictions (dashboard-only vs API claims)
- Analytics time window descriptions inconsistent
- Import limits / rollback behavior stated differently

Severity: **hard** (factual conflict) \| **soft** (ambiguous, reader might misread).

Do **not** duplicate OpenAPI path verification — that's the other audit. Focus on **narrative** and **journey** consistency.

### Phase 5 — Fresh scoring (not the 9.8 rubric)

| Metric | How to compute | Target |
|--------|----------------|--------|
| **Global JSR** | Average of six persona JSR scores | ≥ 90% |
| **Friction rate** | Personas ending `done with friction` / 6 | ≤ 2 |
| **Blocked journeys** | Count of `blocked` | 0 |
| **Diataxis mismatches** | Pages with `mismatch` or `mixed` | ≤ 3 |
| **Dead-end pages** | From confusion graph | 0 |
| **Hard contradictions** | Count | 0 |

**Overall stress score (0–10):**

```
Overall = (Global JSR / 10) × 0.40
        + (10 − min(10, dead_ends × 2)) × 0.15
        + (10 − min(10, hard_contradictions × 3)) × 0.15
        + (10 − min(10, diataxis_mismatches × 1.5)) × 0.15
        + (10 − blocked_journeys × 3.33) × 0.15
```

Round to one decimal. **Pass** = Overall ≥ 9.0 **and** blocked = 0 **and** hard contradictions = 0.

---

## Inputs

| Path | Use |
|------|-----|
| `shared/docs/manifest.yaml` | Page inventory |
| `shared/docs/pages/**/*.md` | All prose |
| `shared/docs/openapi/linkshift-api-keys.openapi.yaml` | Only when a persona hits API steps — confirm cited paths exist |
| `UX_WRITING.md` | Tone violations worth noting in journeys (not a full lint) |
| `.cursor/work/full-docs-audit-findings.md` | **Read only** — do not re-score or copy its matrix; note if your findings **confirm** or **challenge** prior audit |

Optional spot-check: `agents/docs-assistant/dashboard-map/DASHBOARD_MAP.md` when a journey claims a UI label — flag doc/map mismatch as **hard** if confirmed.

---

## Output

Write **only** to:

`.cursor/work/docs-persona-stress-audit.md`

Structure:

```markdown
# Persona journey stress audit

> Auditor: persona stress critic (independent)
> Date: YYYY-MM-DD
> Overall stress score: X.X / 10
> Pass: yes / no

## Executive summary
(4–6 sentences: who gets lost, where, ship recommendation)

## Diataxis map
| Slug | Primary type | Type fit | Prerequisite clarity | Note |

## Persona journeys
### P1 Maya — …
(hop log table + outcome + JSR)

(repeat P2–P6)

## Confusion graph
- Dead ends: …
- Orphans: …
- Loops: …
(mermaid diagram optional)

## Contradictions
### Hard
### Soft

## Score summary
| Metric | Value | Target | Met? |

## Findings (actionable)
Each finding:
- **ID:** S-001
- **Severity:** blocker | major | minor
- **Journey(s):** P1, …
- **Location:** file + section
- **Problem:** what the reader experiences
- **Fix:** concrete doc edit (wording, reorder, signpost, split section) — no code changes

## Comparison with capability audit
(2–4 bullets: confirms / challenges / new angles from full-docs-audit-findings.md)

## Suggested fix queue
(Numbered, prioritized for a future fixer — IDs only, one line each)

## Verification checklist
- [ ] All 32 pages classified in Diataxis map
- [ ] All 6 persona journeys logged with hop tables
- [ ] Confusion graph complete
- [ ] Stress score computed per formula
- [ ] No edits made under shared/docs/
```

Print in chat: executive summary, overall stress score, pass/fail, top 5 findings, path to handoff file.

---

## Rules

- **Read-only** for docs — zero edits under `shared/docs/`.
- **Independent lens** — if capability audit says 9.8, you may still score lower if personas get stuck; explain why.
- Prefer **reader-experienced problems** over checklist compliance.
- Be honest: `done with friction` is not `done`.
- Do not run `docs:sync`.

---

## When to stop

Stop when all six journeys are logged, Diataxis map is complete, confusion graph and contradictions are documented, and the handoff file is written.
