# Observability (redirect & security)

Structured logging via `nestjs-pino` (`Logger`).

## Critical / high-signal events

| Event | Level | When |
|-------|-------|------|
| `Error processing redirect rule` | error | Runtime parse/conditional failure; rule skipped |
| `Redirect blacklist check failed` | error | Blacklist service throw → visitor 503 |
| `Redirect blocked by blacklist` | warn | Host on blacklist → visitor 403 |
| `Redirect rule safety scan failed` | error | Create/update scanner failure |
| `Safety rescan failed` | error | Bull job processor scanner failure |
| `Safety rescan enqueue failed` | error | Midnight scheduler failure |
| `Invalid rate limit, using fallback` | warn | Bad plan limit value |
| `Unknown manipulator` | warn | Runtime modifier typo (API should have blocked) |
| `Error applying manipulator` | error | Modifier threw (e.g. decode edge case) |

## Non-alert noise (expected)

- `L1 cache hit for rate limit` / `L1 cache hit for redirect context` — debug
- `Safety rescan skipped (no domains)` — debug
- `Safety rescan skipped due to Web Risk budget usage` — log at enqueue time

## Customer-visible vs internal

Public docs may state **that** redirects fail closed on blacklist infra errors (`503`). Do not publish log query strings, Datadog dashboards, or on-call runbooks here.

## Email alerts

- Safety rescan blocks rule → owner email (`EmailService`, template references organization name + rule)
- Not triggered for link-map-only rules without rule `destination`

## Analytics vs rescan

- Customer analytics: `GET /api/v1/redirect-rules/analytics` (org-scoped, hourly buckets)
- Rescan selection: `getTopRulesGlobal(50)` — internal aggregate, cross-tenant
