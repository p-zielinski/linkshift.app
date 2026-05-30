# Redirect tests — CI and regression guide

Redirect tests store **expected routing outcomes** for specific requests. Combine them with [simulate](./redirect-rules-operations.md#simulate-before-rollout) to catch routing regressions in CI/CD.

Base path: `/api/v1/redirect-tests`

---

## In the dashboard

In the sidebar, open **Tests**, select **Add test**, or use **Run tests** on the **Tests** page or the **Redirect tests** card under **Redirect Rules**. See [Tests in the dashboard](./dashboard/tests-in-dashboard.md).

---

## What redirect tests are

A redirect test is a fixture:

| Field | Purpose |
|-------|---------|
| `domainGroupId` | Which rule set to test against |
| `pathWithQuery` | Request path including query string |
| `requestData` | Optional method, headers, IP, User-Agent, etc. |
| `expectedResult` | Expected `matched`, `statusCode`, `target` |

Tests are **stored expectations**. Simulation is **live evaluation** against current rules. Your CI compares the two.

---

## Test model

### `pathWithQuery`

Full path + query as the visitor would request (max **16,384** characters):

```
/go/summer?utm=email
/blog/old-post
/pricing?plan=pro
```

### `requestData` (optional)

| Field | Purpose |
|-------|---------|
| `method` | HTTP method (default GET in simulate if omitted) |
| `hostname` | Host header / domain placeholders |
| `ip` | Client IP (available as `{ip}` in destinations) |
| `userAgent` | User-Agent header |
| `headers` | Extra headers (lowercase keys) |
| `query` | Query params merged with any query in `pathWithQuery` (appended, not replaced) |

```json
{
  "method": "GET",
  "hostname": "links.example.com",
  "ip": "203.0.113.10",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
  "headers": {
    "accept-language": "pl-PL"
  },
  "query": {
    "utm": "email",
    "cid": "42"
  }
}
```

**Headers in `requestData`:** Set **`userAgent`** (or `headers.user-agent`) for `{user-agent}` conditionals, **`ip`** for `{ip}` conditionals, and **`headers.accept-language`** for `{accept-language}` / `{accept-language.primary}`. Other headers are stored on the fixture but do not affect simulate or live redirects (no generic `{header.*}` placeholders).

Use `requestData` when testing:

- Conditional routing (`user-agent`, `accept-language`, `ip`, `{method}`)
- Method-specific rules (`matchMethod`)
- Domain placeholder behavior (`hostname`)

If omitted, simulation defaults apply (GET, generated hostname from group domains).

### `expectedResult`

| Field | Limit |
|-------|-------|
| `matched` | boolean |
| `statusCode` | HTTP code (100–599) |
| `target` | Max **4,096** characters; `null` when no match |

```json
{
  "matched": true,
  "statusCode": 302,
  "target": "https://shop.example.com/summer-sale"
}
```

For no-match scenarios:

```json
{
  "matched": false,
  "statusCode": 404,
  "target": null
}
```

---

## Create test examples

### Static redirect

```json
POST /api/v1/redirect-tests
{
  "domainGroupId": "dmg_prod",
  "pathWithQuery": "/legacy",
  "expectedResult": {
    "matched": true,
    "statusCode": 308,
    "target": "https://example.com/new-home"
  }
}
```

### Link map short link

```json
{
  "domainGroupId": "dmg_prod",
  "pathWithQuery": "/go/summer?utm=email",
  "expectedResult": {
    "matched": true,
    "statusCode": 302,
    "target": "https://shop.example.com/summer-sale"
  }
}
```

### Mobile User-Agent conditional

```json
{
  "domainGroupId": "dmg_prod",
  "pathWithQuery": "/",
  "requestData": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
  },
  "expectedResult": {
    "matched": true,
    "statusCode": 302,
    "target": "/mobile-site"
  }
}
```

### Explicit no-match

```json
{
  "domainGroupId": "dmg_prod",
  "pathWithQuery": "/unknown-path",
  "expectedResult": {
    "matched": false,
    "statusCode": 404,
    "target": null
  }
}
```

---

## CI workflow

LinkShift doesn't include a hosted CI runner — run redirect tests from **your** pipeline (GitHub Actions, GitLab CI, etc.) using the API and the pattern below. To create fixtures and run tests interactively, see [Tests in the dashboard](./dashboard/tests-in-dashboard.md). For API keys and authentication, see [Getting started](./getting-started.md).

### 1. Deploy or sync rules

Apply redirect rules and link map entries to target environment (staging/production).

### 2. Load test fixtures

```
GET /api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100
```

If you have more than 100 fixtures, paginate with `startAfterId` until all tests are loaded.

**Pagination loop (load all fixtures):**

```javascript
async function loadAllRedirectTests(api, domainGroupId) {
  const tests = [];
  let startAfterId;

  for (;;) {
    const url = new URL(`${api}/api/v1/redirect-tests`);
    url.searchParams.set('domainGroupId', domainGroupId);
    url.searchParams.set('limit', '100');
    if (startAfterId) url.searchParams.set('startAfterId', startAfterId);

    const page = await fetch(url, { headers: { 'X-API-Key': process.env.KEY } }).then((r) => r.json());
    tests.push(...page.data);
    if (!page.nextAfterId) break;
    startAfterId = page.nextAfterId;
  }

  return tests;
}
```

Simulate accepts at most **100 entries per request**. If you have more than 100 tests, split into batches of ≤100 simulate entries per `POST /api/v1/redirect-rules/simulate` call.

**CI pitfalls before compare:**

| Issue | Symptom | Mitigation |
|-------|---------|------------|
| Invalid `hostname` for `domainGroupId` | **`400`** on the whole `POST` (no `results` array) | Use a hostname from that group, or omit `hostname` to use the group’s first domain |
| Unknown `domainGroupId` in batch | **`400`** on the whole `POST` (`Domain group(s) not found…`) | Ensure every `domainGroupId` exists and belongs to your organization |
| Suspended org / edge paywall | **`402 Payment Required`** on the whole `POST` | Run CI against an org with active redirect access (same check as live edge) |
| Mixed hostnames in one batch | One bad entry fails the entire request | Split simulate calls per hostname or validate fixtures first |

### 3. Build simulate payload from fixtures

Map each test to a simulate entry:

```javascript
const simulatePayload = {
  entries: tests.map((test, index) => ({
    domainGroupId: test.domainGroupId,
    path: test.pathWithQuery.split('?')[0] || '/',
    query: parseQuery(test.pathWithQuery),
    method: test.requestData?.method,
    hostname: test.requestData?.hostname,
    ip: test.requestData?.ip,
    userAgent: test.requestData?.userAgent,
    headers: test.requestData?.headers,
  })),
};
```

### 4. Call simulate

```
POST /api/v1/redirect-rules/simulate
```

Check the **HTTP status** of the simulate response before parsing `results`:

| Status | Meaning |
|--------|---------|
| `200` | Proceed to compare `results[]` |
| `400` | Invalid payload (for example `hostname` not in `domainGroupId`, missing domain group) — **no** `results` array |
| `402` | Organization cannot use redirects (`checkRedirectionAccess`) — **no** `results` array |

### 5. Compare results

For each result at `results[index]`:

```javascript
assert(result.matched === test.expectedResult.matched);
assert(result.statusCode === test.expectedResult.statusCode);
assert(result.target === test.expectedResult.target);
```

**`expectedResult` stores only** `matched`, `statusCode`, and `target` (max 4,096 chars for `target`). It does **not** include `linkMapKey`.

For link map fixtures, add **optional** simulate-only checks when you care which key won:

```javascript
if (test.pathWithQuery.startsWith('/go/')) {
  assert(result.linkMapKey === 'summer');
}
```

Or keep a separate mapping in your CI script (`pathWithQuery` → expected `linkMapKey`). Do not put `linkMapKey` inside `expectedResult` — the redirect-tests API will reject unknown fields.

**`linkMapKey` vs analytics:** Simulate returns `linkMapKey` for link map wins, including **fallback** hits (for example `unknown-code` → fallback URL). Analytics `topLinkMapKeys` also counts non-empty keys on fallback hits but **excludes** empty keys (`/go` only). See [Redirect rules — analytics](../guides/redirect-rules-operations.md#analytics).

Fail the pipeline on any mismatch.

### 6. Report

Include in failure output: `pathWithQuery`, expected vs actual `target`, and rule priority hints from analytics if needed.

---

## Full CI example (pseudo-script)

```bash
#!/bin/bash
# Fetch tests
TESTS=$(curl -s -H "X-API-Key: $KEY" \
  "$API/api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100")

# Build simulate entries (simplified)
SIMULATE=$(echo "$TESTS" | jq '{
  entries: [.data[] | {
    domainGroupId: .domainGroupId,
    path: (.pathWithQuery | split("?")[0]),
    query: (if .pathWithQuery | contains("?") then
      (.pathWithQuery | split("?")[1] | split("&") | map(split("=") | {(.[0]): .[1]}) | add)
    else {} end),
    method: .requestData.method,
    userAgent: .requestData.userAgent,
    ip: .requestData.ip,
    hostname: .requestData.hostname
  }]
}')

# Simulate
RESULTS=$(curl -s -X POST -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d "$SIMULATE" "$API/api/v1/redirect-rules/simulate")

# Compare (implement diff logic)
node compare-redirect-tests.js "$TESTS" "$RESULTS"
```

---

## Simulate limitations (important for CI)

| Live redirect | Simulate |
|---------------|----------|
| Blacklisted destination → `403` | Not checked — still `matched: true` |
| Blacklist check infrastructure error → `503` | Not modeled — live edge does **not** redirect (fail-closed) |
| Organization redirect rate limit → `429` | Not applied |
| Organization access / plan (`checkRedirectionAccess`) → `402` | **Yes** — whole request fails (no per-entry results) |
| Invalid `hostname` or unknown `domainGroupId` in batch | **`400`** — whole request fails (no `results`) |
| Returns `linkMapKey` for link-map rules | Yes on entry or fallback hit — `null` on map miss (no entry, no fallback) |
| Link map path match + lookup miss | Skip rule (next rule) | `matched: false`, `404`, `linkMapKey: null` |
| Returns matched rule ID | N/A | **No** |
| `path` + `requestData.query` in simulate | Merged (append) | Same when mapping fixtures to simulate entries |
| Default `ip` when omitted | `127.0.0.1` |
| `hostname` must belong to `domainGroupId` when group has domains | Enforced — otherwise `400` on whole simulate call |
| Default `hostname` when omitted | First domain in group (`createdAt` asc), or `group-{id}.local` |
| Request scheme in simulate | Always **HTTPS** — do not send `protocol` on simulate entries |
| `isBlocked` rules | Excluded from both |

See [Redirect rules — simulate vs live](./redirect-rules-operations.md#simulate-vs-live-redirect) and [Hostname and defaults](./redirect-rules-operations.md#hostname-and-defaults).

---

## Testing dynamic destinations

Rules with `random()` or `time()` produce **non-deterministic** results. For CI:

| Feature | Testing approach |
|---------|------------------|
| `random()` A/B | See [CI pattern for A/B rules](#ci-pattern-for-ab-and-scheduled-rules) below |
| `time()` schedules | Split into separate fixtures per branch, or test only the “before launch” branch with a fixed `expectedResult` |
| User-Agent routing | Set `userAgent` in simulate entry |
| `{ip}` branching | Set `ip` in simulate entry |

Prefer testing **deterministic branches** with fixed inputs.

### CI pattern for A/B and scheduled rules

Simulate does not fix `random()` or wall-clock time. Use one of these patterns:

**Option A — test deterministic branches only**

Create redirect tests for each branch input you control:

```json
{
  "pathWithQuery": "/landing",
  "requestData": { "userAgent": "Mozilla/5.0 (iPhone; …)" },
  "expectedResult": { "matched": true, "statusCode": 302, "target": "/mobile-flow" }
}
```

Keep the production rule’s conditional; assert only branches you can force via `userAgent`, `ip`, or path.

**Option B — separate staging rules for CI**

In staging, duplicate traffic with **static** destinations (no `random()`) and point redirect tests at those rule IDs/paths. Promote conditional rules to production after manual simulate spot-checks.

**Option C — statistical smoke (non-gating)**

Run simulate N times against `random(0,100) < 50 ? …` and assert both targets appear at least once. Use as a monitoring smoke test, not a hard CI gate.

**Option D — link map + static entries**

For campaign URLs, prefer link map entries (deterministic targets) and assert `linkMapKey` + `target` in simulate.

---

## When to add tests

Add redirect tests when:

- Launching new link map campaigns with critical URLs
- Migrating paths (regex rules)
- Adding conditional routing (mobile, schedules)
- Changing rule priority order

Update tests when:

- Destination URLs change intentionally
- Link map entries are updated
- Fallback behavior changes

---

## Plan limits and list API

| Field / param | Limit |
|---------------|-------|
| `pathWithQuery` | Max **16,384** characters (same order of magnitude as rule `source`) |
| `expectedResult.target` | Max **4,096** characters |
| `requestData.userAgent` | Max **512** characters |
| List `limit` | 1–**100** per page (default **100**) |
| List `search` | Optional case-insensitive substring on `pathWithQuery` |
| List `startAfterId` | Cursor pagination |

Simulate batch size when mapping fixtures: max **100** entries per `POST /api/v1/redirect-rules/simulate` — see [Redirect rules — simulate](./redirect-rules-operations.md#simulate-before-rollout).

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/redirect-tests` | List tests (`domainGroupId`, `limit`, `search`, `startAfterId`) |
| `GET` | `/api/v1/redirect-tests/:id` | Get one test |
| `POST` | `/api/v1/redirect-tests` | Create test |
| `PUT` | `/api/v1/redirect-tests/:id` | Update test |
| `DELETE` | `/api/v1/redirect-tests/:id` | Delete test |

---

## Related guides

- [Redirect rules — simulate](./redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — analytics](./redirect-rules-operations.md#analytics)
- [Link maps](./link-maps.md)
