# Rate limiting (internal)

Implementation: `backend/src/cache/cache-manager.service.ts` (`checkRateLimit`, `checkOrganizationRateLimit`).

## Scopes

| Scope | Enum | Subject ID | Plan field | Fallback if invalid limit |
|-------|------|------------|------------|---------------------------|
| Redirect (edge) | `REDIRECTION` | `organizationId` | `redirectionLimitPerMinute` | `PLAN_LIMITS.FREE.redirectionLimitPerMinute` (50) |
| Management API | `API_KEY` | API key ID | `apiKeyCallsPerMinute` | `PLAN_LIMITS.BASIC.apiKeyCallsPerMinute` (10) |

Configured plan values: `backend/src/billing/billing.config.ts` (Basic: 50 redirect/min, 10 API/min; Pro: 100 redirect/min, 50 API/min).

## Algorithm (per scope, per subject, per UTC minute)

1. **Bucket key:** `YYYY-M-D:H:M` from `Date` UTC (`getUTCFullYear`, `getUTCMonth`, `getUTCDate`, `getUTCHours`, `getUTCMinutes`).
2. **L1 short-circuit (blocked state):** Key `RATE_LIMIT_BLOCK:{scope}:{subjectId}:{minuteKey}`. If present in process-local LRU, throw immediately **without Redis** (`throwLimitError`).
3. **Redis counter:** Key `RATE_LIMIT:{scope}:{subjectId}:{minuteKey}`. `INCR`; on first increment (`count === 1`), `EXPIRE` **65 seconds** (minute boundary + buffer).
4. **Reject when:** `currentCount > effectiveLimit` (strictly greater — limit N allows N requests in the window).
5. **On reject:** Set L1 block key with TTL = seconds remaining in current UTC minute (`60 - getUTCSeconds()`), then throw.

Limits `<= 0` or non-finite skip enforcement (no-op return).

Invalid positive limits log `Invalid rate limit, using fallback` and use scope fallback.

## Redirect pipeline placement

`RedirectService.checkOrganizationAccessForRedirect` runs **before** `robots.txt` and **before** rule evaluation:

1. `checkRateLimit(REDIRECTION, orgId, redirectionLimitPerMinute)`
2. `organizationService.checkRedirectionAccess(orgId)` → may throw `402`

Simulate (`simulateRedirects`) and redirect-test fixtures **do not** call redirect rate limit. Simulate **does** call `checkRedirectionAccess`.

## API key limiter

`ApiKeyService` calls `checkRateLimit(API_KEY, apiKeyId, apiKeyCallsPerMinute)` per authenticated Management API request. Error details: `API key rate limit exceeded` (`429`).

## Other limiters (out of redirect docs scope)

- Login: `LoginRateLimitService` (auth endpoints)
- Public tools QR: `QrCodeRateLimitService` (`backend-tools/`)

Do not document exact login/QR thresholds in public docs.
