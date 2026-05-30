# LinkShift dashboard map

> **Status:** reviewed  
> **Last verified against code:** 2026-05-30  
> **Primary sources:** `frontend/src/app/app.routes.ts`, `frontend/src/app/core/layout/app-shell.component.ts`, feature folders under `frontend/src/app/features/`

This map describes the **authenticated app shell** (`AppShellComponent`) and dialogs that create or edit redirect resources. It does not cover public marketing routes (`/home`, `/pricing`, …) or the `/docs` site structure (see `shared/docs/manifest.yaml`).

## Hierarchy (product model)

```text
Organization (tenant)
  └── Domain group (container + robots.txt policy)
        ├── Custom domain (FQDN attached to group)
        ├── Starter subdomain (*.linkshift host pattern)
        ├── Redirect rules (match + destination; may attach link map)
        │     └── Link map (short keys under a rule path prefix)
        │           └── Link map entries (key → destination)
        └── Redirect tests (expected request/response per rule)
```

Most redirect-resource sections require **at least one domain group** before route activation and before several sidebar items become clickable.

## App shell

| Element | Location | Notes |
|---------|----------|-------|
| Logo + tagline | Sidebar header | Tagline **Environment-ready routing** |
| Left sidebar nav | `AppShellComponent` | Fixed on desktop; overlay on mobile (`≤1023px`, `MOBILE_BREAKPOINT`) |
| Ask docs drawer | Right overlay (`DocsAssistantComponent`) | CTA **Ask docs** (AI badge); hint **Answers from documentation**; `aria-label` **Open Ask docs** |
| User email + **Log out** | Sidebar footer | Logout navigates to `/auth` |
| Domain-group gate (nav) | `requiresDomainGroups` on nav items | Disabled link + tooltip: *"Create a domain group to access this section."* |
| Domain-group gate (route) | `domainGroupsRequiredGuard` | Redirects to `/dashboard` when org has zero groups (client only; SSR allows pass-through) |

**Auth on shell parent:** `authGuard` + `legalConsentGuard`.

### Sidebar routes (`NAV_ITEMS`)

| Label | Route | Icon | Nav `requiresDomainGroups` | Route `domainGroupsRequiredGuard` |
|-------|-------|------|------------------------------|-----------------------------------|
| Dashboard | `/dashboard` | dashboard | no | no |
| Analytics | `/redirect-rules-analytics` | analytics | **no** | **yes** |
| Profile | `/profile` | person | no | no |
| Organization | `/organization` | groups | no | no (`matchSubRoutes`: `/organization/api-keys`) |
| Domain Groups | `/domain-groups` | layers | no | no |
| Domains | `/domains` | public | yes | yes |
| Subdomains | `/subdomains` | alternate_email | yes | yes |
| Redirect Rules | `/redirect-rules` | swap_horiz | yes | yes |
| Link Maps | `/link-maps` (+ `/link-maps/:id`) | map | yes | yes (`matchSubRoutes`) |
| Tests | `/tests` | science | yes | yes |
| Tools | `/tools`, `/tools/*` | construction | no | no (`matchSubRoutes`) |
| Docs | `/docs` (+ children) | description | no | no (separate shell — see below) |

**Nav vs guard mismatch:** **Analytics** is clickable without domain groups, but direct navigation runs `domainGroupsRequiredGuard` and sends users to `/dashboard` when the org has no groups.

### Authenticated shell routes (not all in sidebar)

| Route | Component | Guard |
|-------|-----------|-------|
| `/legal/consent` | `LegalConsentPageComponent` | shell auth only |
| `/tools/qr-code-generator` | `ToolsQrCodeGeneratorPageComponent` | shell auth only |
| `/tools/redirect-tester` | `ToolsRedirectTesterPageComponent` | shell auth only |
| `/organization/api-keys` | `OrganizationApiKeysPageComponent` | shell auth only |

SSR: dashboard shell routes use `RenderMode.Client` in `app.routes.server.ts`; `/docs` routes are prerendered separately.

### Table pagination (`pageLimitOptions`)

| Page | Options |
|------|---------|
| Domain groups | 10, 20, 50 |
| Domains | 10, 20, 50 |
| Subdomains | 10, 20, 50 |
| Redirect rules | **20 only** |
| Tests | **100 only** |
| Link maps (list) | *(no paginator — full list for selected group)* |
| Link map details (entries) | 20, 50, 100 |
| Organization API keys | *(no paginator)* |

### Cross-route flows

| Flow | Start | Trigger | Opens / lands on |
|------|-------|---------|------------------|
| Rule create → test wizard | `/redirect-rules` | Save **new** rule (`openTestWizard`) | `RedirectTestFormDialogComponent` with prefill; see `/tests` for full CRUD |
| Rule wizard → link map | `/redirect-rules` | Create link map from rule **Match** step | `LinkMapFormDialogComponent` (nested); saved map selectable in rule |
| Run pending tests | `/redirect-rules` or `/tests` | **Run tests** | `RunPendingTestsDialogComponent` → row opens `RedirectTestResultDialogComponent` |
| Organization → API keys | `/organization` | **Manage API keys** | `/organization/api-keys` |
| Dashboard onboarding | `/dashboard` | Auto within 1h of `user.createdAt` unless `localStorage` `dashboard-onboarding-confirmed` | `DashboardOnboardingDialogComponent` |
| Legal consent block | Any shell route | `legalConsentGuard` when consent outdated | `/legal/consent` until **Continue** |
| Upgrade / checkout | `/dashboard` or pricing (marketing) | **Upgrade** / checkout completion | `UpgradeDialogComponent` → `CheckoutStatusDialogComponent` (Paddle flow) |

---

## `/dashboard`

**Component:** `DashboardPageComponent`  
**Header:** title **Dashboard**; subtitle *Operational overview for the active organization.*

| Block | UI |
|-------|-----|
| Session details | Email, role (Owner / Member), **User ID** (copy when truncated) |
| Organization profile | Name, **Organization ID** (copy when truncated) |
| Subscription snapshot | Plan, status, amount/currency, interval, active from/until |
| Subscription limits and analytics retention | Usage vs limits, per-group caps, API/redirection rates, retention days — over-limit copy **Upgrade plan to increase this limit.** and badge **Limit reached** |
| Suspension banner | When over limits or status `SUSPENDED` |

| Action | Label | Behavior |
|--------|-------|----------|
| Upgrade | **Upgrade** | Opens `UpgradeDialogComponent` (title **Change your subscription**) when plan ≠ `UNMETERED` |
| Manage subscription | **Manage subscription** | Paddle customer portal (`BillingApiService.getCustomerPortal`) when plan ≠ `FREE` |
| Cancel subscription | **Cancel subscription** | Confirm dialog (title **Cancel subscription**) → same portal |

**Usage/limit cards (section):** Domain groups, Domains per group limit, Subdomains per group limit, Domains, Subdomains, Rules per group limit, Link map entries per map, Rules, Link maps, Link map entries, Tests, Active users, Redirections per minute, API keys, API calls per minute per key, Current plan analytics retention days.

**Onboarding:** `DashboardOnboardingDialogComponent` (wizard) auto-opens within **1 hour** of user `createdAt` unless `localStorage` key `dashboard-onboarding-confirmed` is `true` (set on **Confirm and continue**). Dev flag `DASHBOARD_ONBOARDING_SHOW_ALWAYS` forces show.

| Field | Value |
|-------|-------|
| Dialog title | `Welcome to LinkShift, {organizationName}` |
| Dialog subtitle | *We prepared this short walkthrough to help you get value quickly.* |
| Primary / skip | **Confirm and continue** / **Skip for now** |

| Step id | Nav label | Step title | Primary actions |
|---------|-----------|------------|-----------------|
| welcome | Welcome | You are ready to ship redirects | — |
| domains | Domains | Domain groups and hosts | — |
| rules | Rules | Redirect hierarchy | — |
| next | Next steps | What to do now | **Confirm and continue** / **Skip for now** |

**Checkout:** `CheckoutStatusDialogComponent` opened from `PaddleCheckoutFlowService` after upgrade/checkout (not from dashboard buttons directly).

---

## `/domain-groups`

**Shell:** `ResourcePageShellComponent` — title **Domain Groups**; primary **Add group**.

| Action | UI | Wizard |
|--------|-----|--------|
| Create | **Add group** | `DomainGroupFormDialogComponent` |
| Edit / delete | Table row | Same wizard; confirm title **Delete domain group** |

**Wizard steps** (nav `label` → step `title`):

| id | label | title |
|----|-------|-------|
| details | Details | Domain group details |
| robots | Robots.txt | Robots.txt policy |

**Robots policy values (UI labels):** `NONE` — *Do not use (None)*; `ALLOW_ALL` — *Allow all*; `DISALLOW_ALL` — *Disallow all*; `DISALLOW_BAD_BOTS` — *Disallow bad bots*; `CUSTOM` — *Custom* (custom content required, max length enforced in component).

**Table:** paginator **10 / 20 / 50**; shows domain count per group when domains list loaded.

**Save UX:** `LoadingDialogComponent` while saving.

---

## `/domains`

**Primary actions:** **Domain setup** (`DomainSetupDialogComponent` — heading **Configure your domain**, DNS target IP / A record guidance) · **Add domain** (`DomainFormDialogComponent`).

| Action | Wizard / dialog |
|--------|-----------------|
| Add / edit domain | `DomainFormDialogComponent` — step **Details** → title **Domain details** (FQDN, domain group) |
| Delete | Confirm — title **Delete domain** |
| Domain setup help | `DomainSetupDialogComponent` (non-wizard modal) |

**Filter:** `DomainGroupSelectComponent` with **All domain groups** when `includeAllOption` is true.

**Save UX:** `LoadingDialogComponent` while saving.

---

## `/subdomains`

**Header:** title **Subdomains**; subtitle *LinkShift-hosted subdomains mapped to your domain groups.*

**Primary:** **Add subdomain** · wizard `SubdomainFormDialogComponent` — step **Details** → title **Subdomain details** · edit/delete (confirm **Delete subdomain**).

**Info card:** **Base Routing Host** — shows `subdomainBaseHost()` and resolution format `{name}.{base}`.

**Host display:** `formatSubdomainHost` → `{name}.{APP_SUBDOMAIN_BASE_URL or APP_BASE_URL host}`.

**Filter:** domain group select (required; no “all groups” option).

**Save UX:** `LoadingDialogComponent` while saving.

---

## `/redirect-rules`

**Header:** title **Redirect Rules**; subtitle *Define path-level routing actions for each domain group.*

**Primary:** **Add rule** (disabled until a domain group is selected in filter; snackbar if create attempted without group).

| Action | UI | Wizard / dialog |
|--------|-----|-----------------|
| Create / edit rule | **Add rule** / row | `RedirectRuleFormDialogComponent` |
| Delete rule | Row | Confirm — title **Delete redirect rule** |
| Run pending tests | Summary card **Run tests** | `RunPendingTestsDialogComponent` (title **Run tests**) |
| Create test (chained) | After **create** rule save | Rule wizard closes with `openTestWizard` → `RedirectTestFormDialogComponent` prefilled |

**Rule wizard steps** (nav `label` → step `title`):

| id | label | title |
|----|-------|-------|
| scope | Scope | Scope & priority |
| match | Match | Request matching |
| destination | Destination | Destination logic |
| status | Status | Status code |
| summary | Summary | Review |

**Nested wizard:** from rule wizard, can open `LinkMapFormDialogComponent` (create map in context).

**Variable reference panel** (destination step): tokens include `domain.fqdn`, `domain.label`, `domain.root`, `domain.extension`, `domain.subdomain`, `path`, `segments.0`, … — see `variableReferences` in `redirect-rule-form-dialog.component.ts`.

**Filter:** domain group select + search label **Search source or destination** (`DomainGroupFilterPersistenceService`).

**Tests summary card** (section title **Redirect tests**): metrics **Pass rate**, **Passed**, **Needs attention**, **Not run**; **Run tests**; copy *Select a domain group to preview tests.* when no group; *Run tests to refresh results* on not-run tile; footer *Results reflect runs started from this session.*

---

## `/link-maps`

**List** — title **Link Maps**; subtitle *Create reusable short-link maps for each domain group.* Primary **Add link map** (disabled until domain group selected); filter by domain group (required, no “all” option); **no table paginator**; row navigates to `/link-maps/:id`.

| Action | Wizard |
|--------|--------|
| Create / edit map | `LinkMapFormDialogComponent` — step **Details** → title **Link map settings** |
| Delete map | Row/menu — **Delete link map** |

### `/link-maps/:id`

Detail shell title: link map **name** (fallback **Link map**).

| Action | Label |
|--------|-------|
| Back | **Back to list** |
| Edit map | **Edit settings** |
| Add entry | **Add entry** → `LinkMapEntryFormDialogComponent` (step **Entry** → title **Entry details**) |
| Import | **Import entries** → `LinkMapEntriesImportDialogComponent` (step **Import** → title **Bulk import entries**; save **Import entries** / **Close** after result; **Rollback imported entries** when eligible) |
| Bulk delete | **Delete selected (N)** → `LinkMapEntriesDeleteConfirmDialogComponent` (step **Confirm** → title **Delete selected entries**) |

Entry search label **Search by key or destination**; paginator **20 / 50 / 100**; selection persists across pages.

**Import limits (UI):** up to **500** rows per import; paste formats described in dialog copy.

---

## `/tests`

**Header:** title **Tests**; subtitle *Validate redirect outcomes without leaving the dashboard.*

**Actions:** **Run tests** (pending) · **Add test** (both disabled until domain group selected).

| Action | Wizard / dialog |
|--------|-----------------|
| Create / edit | `RedirectTestFormDialogComponent` — steps below |
| Delete | Confirm — title **Delete redirect test** |
| Run pending | `RunPendingTestsDialogComponent` (title **Run tests**) |
| View result | `RedirectTestResultDialogComponent` (title **Test result**) from table or run dialog |

**Test wizard steps** (nav `label` → step `title`):

| id | label | title |
|----|-------|-------|
| scope | Scope | Request scope |
| request | Request | Request details |
| expected | Expected | Expected outcome |

**Expected step:** button **Fetch expected result** (label **Simulating...** while loading).

**Filter:** domain group + **Search by path or query**.

---

## `/redirect-rules-analytics`

**Header:** **Redirect rules analytics** · subtitle *Traffic distribution for the selected time window.* · retention banner label **Current plan retention days** (numeric value).

| Control | Notes |
|---------|-------|
| Domain group | `DomainGroupSelectComponent` with `includeAllOption` — option **All domain groups** (empty value = all) |
| Quick ranges | Section **Quick ranges**: **Last 3 days**, **Last 7 days**, **Last 14 days**, **Last 30 days** |
| Custom range | **Start date & time**, **End date & time**, **Apply range** |
| Results | Chart + top-rules table |
| Rule drill-down | `RuleAnalyticsDialogComponent` — title **Rule analytics details**; subtitle *Full rule information with hit count.*; metric **Hits in range** |

---

## `/organization`

**Header:** **Organization** · subtitle *Invite teammates and manage access to your workspace.*

| Block | UI |
|-------|-----|
| Team seats | Active users / max; progress bar; copy *Only active members count toward your seat limit.* |
| API keys card | Quota + rate; **Manage API keys** → `/organization/api-keys`; copy *Key management is available to all plans. API usage requires a paid plan.* |
| Invite | Section **Invite a teammate**; field **Invite email**; button **Send invite** (owner only; seat-limit tooltips). Copy: invitations valid **30 minutes**; owner approval required. |
| Members table | Columns Email, Role, Status, Email verified; owner row actions **Block** / **Unblock** for non-owners |

### `/organization/api-keys`

**Header:** **API keys** · subtitle *Create and maintain organization-scoped API keys for programmatic management.* (not in sidebar; reached from organization page).

| Block | UI |
|-------|-----|
| Summary cards | API keys count vs limit, rate limit (calls/min per key), policy text |
| API integration | **API server base URL** (code display); **Go to documentation**; **Download OpenAPI spec** |

| Action | Label / dialog |
|--------|----------------|
| Create | **Create API key** → `ApiKeyFormDialogComponent` (form modal: **Key name**, **Never expires**, optional **Expires at**; titles **Create API key** / **Edit API key**) |
| After create | `ApiKeyCreatedDialogComponent` shows secret once |
| Edit / delete | Row actions → edit dialog / confirm **Delete API key** |

No scopes field in UI. Table has no paginator.

---

## `/profile`

**Header:** **Profile** — subtitle *Manage your account email and verification status.*

| Section | Actions / copy |
|---------|----------------|
| Account email | Status pill **Verified** / **Unverified**; **Resend verification email** when unverified (browser only) |
| Change email | **New email**; verified flow: **Send verification code** → **Verification code** → **Confirm email**; unverified flow: **Update email and send verification** |
| Legal consent | Version + minimum age; if update needed: **Review and accept updates** → `/legal/consent` |

No in-dashboard password change UI (password reset is `/reset-password` outside shell nav).

---

## `/tools`

| Tool | Route | Hub card CTA |
|------|-------|----------------|
| QR Code Generator | `/tools/qr-code-generator` | **Open tool** |
| Redirect Tester | `/tools/redirect-tester` | **Open tool** |

Hub header: **Tools** · subtitle *Operational utilities for diagnosing redirects and generating share-ready QR assets.*

Public equivalents: `/qr-code-generator`, `/redirect-tester` (marketing shell).

---

## `/docs` (sidebar link)

**Not inside `AppShellComponent`.** Route tree uses `DocumentationSiteShellComponent` (own layout; Ask docs drawer at `≤767px` breakpoint). `/docs` routes are **not** behind `authGuard` (public docs site; session persists if logged in). Child `docs/assistant` redirects to docs overview.

Authenticated users leave dashboard chrome when navigating to `/docs`.

---

## Auth & legal (outside main nav)

| Route | Shell | Purpose |
|-------|-------|---------|
| `/auth` | none (guest) | Login / register |
| `/verify-email`, `/reset-password`, `/invite` | none | Account flows |
| `/legal/consent` | app shell | Title **Review updated terms**; checkboxes for Terms, Privacy, age; primary **Continue** (`legalConsentGuard` blocks other shell routes until satisfied) |

Marketing/legal pages under `MarketingShellComponent`: `/terms`, `/privacy`, `/cookies`, `/do-not-sell`, etc.

---

## Dialog inventory (redirect resources & ops)

| Component | Type | Used from |
|-----------|------|-----------|
| `DomainGroupFormDialogComponent` | wizard | domain-groups |
| `DomainFormDialogComponent` | wizard | domains |
| `DomainSetupDialogComponent` | modal | domains (**Domain setup**) |
| `SubdomainFormDialogComponent` | wizard | subdomains |
| `RedirectRuleFormDialogComponent` | wizard | redirect-rules |
| `LinkMapFormDialogComponent` | wizard | link-maps, link-map details, nested from rule wizard |
| `LinkMapEntryFormDialogComponent` | wizard | link-map details |
| `LinkMapEntriesImportDialogComponent` | wizard | link-map details |
| `LinkMapEntriesDeleteConfirmDialogComponent` | wizard | link-map details |
| `RedirectTestFormDialogComponent` | wizard | tests, redirect-rules (post-create chain) |
| `RunPendingTestsDialogComponent` | modal | tests, redirect-rules summary |
| `RedirectTestResultDialogComponent` | modal | tests, run-pending dialog |
| `DashboardOnboardingDialogComponent` | wizard | dashboard (auto) |
| `UpgradeDialogComponent` | modal | dashboard |
| `CheckoutStatusDialogComponent` | modal | Paddle checkout flow |
| `ApiKeyFormDialogComponent` | form modal | organization api-keys |
| `ApiKeyCreatedDialogComponent` | modal | after key create |
| `RuleAnalyticsDialogComponent` | modal | analytics |
| `ConfirmDialogComponent` | shared | deletes / cancel subscription confirm |
| `LoadingDialogComponent` | modal | domain-group, domain, subdomain saves |

**Explicitly out of scope (docs map):** `DocumentationTryMeDialogComponent` (docs API try-me), marketing-only dialogs, auth page flows.

---

## Cross-cutting UI patterns

| Pattern | Where |
|---------|-------|
| `ResourcePageShellComponent` | Most list/detail pages |
| `ResourceTableCardComponent` + `TablePaginatorComponent` | Tables where pagination is configured (see table above) |
| `DomainGroupSelectComponent` | Filters; default label **Domain group**; all-option **All domain groups** when `includeAllOption` |
| `WizardDialogService` | Full-screen-style wizards |
| `ConfirmDialogComponent` | Deletes and some billing confirms |
| Snackbar | Store/API errors on pages |

---

## Open gaps (for doc writers)

- Pair UI flows with OpenAPI guides for validation messages and engine edge cases (`shared/docs`).
- Document Paddle portal vs in-app **Upgrade** / **Cancel subscription** end-to-end.
- Explain **Analytics** nav enabled without groups vs guard redirect (onboarding UX).
- Rule wizard → test wizard chain and **Fetch expected result** (simulate) deserve a “test before deploy” guide.
- Link map CSV import rollback and 500-row limit vs API docs.
- Dashboard usage numbers: cite `OrganizationUsageStore` / plan limits model, not hard-coded caps in map.
- Profile email-change flows (verified vs unverified) and legal consent updates on `/profile` vs `/legal/consent`.

---

## Verification checklist (critic pass 3)

- [x] Compared `NAV_ITEMS` in `app-shell.component.ts` to the sidebar table (incl. Analytics nav/guard mismatch, `matchSubRoutes` for link maps, tools, organization/api-keys)
- [x] Accounted for every wizard/dialog that mutates redirect resources (grep `steps` / dialog components under `features/`)
- [x] Confirmed `domainGroupsRequiredGuard` routes match `app.routes.ts`
- [x] Separated marketing/auth/legal and `/docs` documentation shell from dashboard scope
- [x] Verified `pageLimitOptions` (or “no paginator”) per list/detail table
- [x] Spot-checked primary button and wizard step labels on pages touched this pass (onboarding, domain group, domain/subdomain/entry wizards, tests summary, analytics subtitle, API keys subtitle)
- [x] Documented cross-route flows (nested wizards, post-save chains, shared modals used from multiple routes)
- [x] Ran doc coverage advisory (section C) against `dashboard-doc-writer.md`
