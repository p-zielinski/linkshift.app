# Redirect engine — code review queue (for TDD follow-up)

This file listed **potential product/engine bugs** found during a docs audit (May 2026).  
Items below were verified with tests in May 2026 unless noted.

---

## Resolved

### 1. Blacklist check failure may still redirect (P0) — **fixed**

**Decision:** Fail-closed. When `domainBlacklistService.isBlacklisted()` throws, live redirect returns **`503 Service Unavailable`** with JSON (`Couldn't verify redirect destination. Try again in a moment.`) and does not call `res.redirect`.

**Tests:** `redirect.service.spec.ts` — blacklist throw → 503; blocked → 403; allowed → redirect.

**Docs:** `shared/docs/pages/concepts/redirect-engine-concepts.md`, `guides/redirect-rules.md`.

---

### 2. Link map `ignore` + entry keys containing `?` (P1) — **fixed**

**Decision:** Strategy **B** (normalize on write — already in `normalizeEntries`) plus **lookup by path** in `buildContext` for `queryMatch: ignore` so legacy rows with query in `keyNormalized` still match.

**Tests:** `link-map.service.spec.ts` — create strips query on ignore maps; legacy `keyNormalized` with query resolves by path.

**Docs:** `link-map-entries.md`, `link-map-concepts.md`.

---

## Open / by design

### 3. Simulate vs live parity gaps (P2) — **by design (May 2026)**

| Gap | Live | Simulate |
|-----|------|----------|
| Blacklist → 403 | Yes | No |
| Blacklist infra error → 503 | Yes | No |
| Org redirect rate limit | Yes | No |

**Decision:** Do **not** extend simulate with `blacklistBlocked` / `wouldBeBlocked` for now. Simulate stays a rule-matching and destination-resolution preview; safety and rate limits remain live-only. Revisit if CI needs explicit blacklist signals.

**Docs:** Documented in `redirect-rules.md` (simulate vs live table).

---

## Completion checklist

- [x] Reproduce items 1–2 with unit tests
- [x] Fix code with minimal scope
- [x] Run backend tests for touched areas
- [x] Update `shared/docs/pages/**`
- [x] Run `npm run docs:sync` from repo root
- [x] Archive resolved items in this queue
