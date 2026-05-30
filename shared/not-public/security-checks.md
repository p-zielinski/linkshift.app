# Security checks (internal)

## Request lifecycle (live redirect)

Order in `RedirectService.executeRedirectFromDomainGroup`:

```
1. checkOrganizationAccessForRedirect
     → rate limit (429)
     → checkRedirectionAccess (402)
2. robots.txt short-circuit (if applicable)
3. getRedirectMatch (rules: isBlocked=false, deletedAt=null)
4. If absolute target host:
     domainBlacklistService.isBlacklisted(host)
       → true: 403 JSON (no redirect)
       → throw: 503 fail-closed (no redirect)
5. res.redirect(statusCode, target)
```

Root-relative `/path` targets skip step 4 (`extractUrl` returns null).

Simulate: steps 3-style matching only; **no** rate limit, **no** blacklist.

## Create/update validation

**Redirect rules** (`RedirectService` create/update):

- `RuleValidatorService.validate(source, destination)` — placeholders, ternaries, regex, `$N`.
- If `destination` non-null: `SafetyScannerService.checkUrls` on extracted static URLs. Failure → `400`; scanner infra error → `500`.
- Link map rules (`linkMapId`, `destination: null`): no rule-level destination scan; `validateLinkMapRule` enforces plain path, `pathMatch=prefix`, `queryMatch=ignore`, no `*`, no `?` in source, no regex.

**Link maps / entries** (`LinkMapService`): entry `destination` and map `fallbackDestination` scanned on write; same fail-closed pattern.

**GeoIP:** `{geo.country}` rejected in `RuleValidatorService` (`Unknown variable: "geo.country"`). No runtime stub in `extractVariables` — comment-only future hook in `redirect.service.ts`.

## Domain blacklist

- Service: `DomainBlacklistService`
- Checked only for resolved `http://` / `https://` hosts after rule match
- Warn log: `Redirect blocked by blacklist` (ruleId, domain, hostname)
- Infra error log: `Redirect blacklist check failed` → 503

## Daily safety rescan

| Item | Value |
|------|--------|
| Scheduler | `SafetyRescanScheduler` — `EVERY_DAY_AT_MIDNIGHT` UTC |
| Quota gate | `WebRiskQuotaService.shouldRunRescan()` — skip entire run if budget threshold exceeded |
| Rule selection | `RedirectAnalyticsService.getTopRulesGlobal(50)` — **platform-global** hit ranking, **last 24 UTC hours** (not per-org) |
| Queue | Bull `SAFETY_RESCAN_QUEUE`, jobs `rescan` with `{ ruleId, hits }` |
| Processor | `SafetyRescanProcessor` — skips rules without `destination`, extracts URLs via `DestinationExtractorService`, `SafetyScannerService.checkUrls` |
| On unsafe | `isBlocked: true`, `blockedAt`, optional blacklist hosts, email to org owner via `EmailService` |
| Link map rules | Skipped at processor when `destination` is null |

**Unblock:** Any successful `PUT` on rule sets `isBlocked: false` (`redirect.service.ts` update path).

## Web Risk / scanner

- `SafetyScannerService` — Google Web Risk with monthly budget (`WebRiskQuotaService`)
- Public docs: describe outcomes (`isBlocked`, 403/503), not API quotas or batch sizes

## Input hardening (regex)

- Stored rule regex: `parseStoredRegexSource` / `isStoredRegexSource` in `redirect-source.util.ts`
- Invalid compile → API `400` on save
- Runtime rule errors → rule skipped, `logger.error('Error processing redirect rule', …)`

Do not publish Web Risk project IDs, quota percentages, or scanner bypass details.
