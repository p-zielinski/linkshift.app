# Frontend Coding Standards

## Component Architecture
- Keep page components thin: state management, dialog orchestration, and store wiring only.
- Apply DRY consistently: extract reusable feature/tool components instead of copying logic between pages.
- Move list rendering and formatting logic into dedicated table components.
- Use standalone components with explicit `imports` and typed `input`/`output` APIs.
- Prefer composition over inheritance: `ResourcePageShell` + `ResourceCard` + `ResourceTableCard`.
- Use named content slots consistently: `page-actions`, `table-content`, `table-footer`.
- Use `WizardDialogService.openWizard` for multi-step resource creation flows.
- Keep wizard step definitions inside the owning component and pass them to `app-wizard`.

## Styling and Layout
- Use Tailwind utility classes for layout, spacing, and typography.
- Avoid component-scoped CSS for layout and state badges when utilities are sufficient.
- Keep card surfaces consistent by wrapping list and filter areas in `ResourceCard`.
- Ensure table containers use `min-h-0` and `overflow-auto` for correct scrolling.

### App dashboard page layout
- Authenticated app pages use `ResourcePageShell` (`app-resource-page-shell`); do not use `min-h-[calc(100vh)]` for dashboard layout. Shell `:host` must stretch (`flex: 1 1 0`, `min-height: 0`); inner layout root uses `flex-1`, not `h-full`.
- Page body is always **top-aligned** and fills available height (`justify-start`); do not vertically center page body or empty states with `justify-center` on flex fill containers.
- **Content pages** (cards, forms): default `bodyScroll` (true) — body scrolls as one block; header stays fixed.
- **Table pages**: `[bodyScroll]="false"` + `ResourceTableCard` — host stretches to remaining height; table scrolls inside the card (`fillHeight` on inner `ResourceCard`).
- **Analytics / hybrid pages**: `[bodyScroll]="false"`; filter sections `shrink-0`; primary panel `flex min-h-0 flex-1 flex-col`.
- Height chain: `AppShell` → `.app-page-host` → page shell → body or table scroll. See `.cursor/work/dashboard-page-layout-blueprint.md`.
- `.app-page-host` must not use `> *` for flex fill — Angular renders `router-outlet` as a sibling of the routed component; hide the outlet (`display: none`) and target `:not(router-outlet)` only (same pattern as docs site shell).
- **Workspace filter:** use `attachPageWorkspaceFilter()` on pages that scope data by site; `ResourcePageShell` shows `WorkspaceSwitcher` in the page header (menu popover), not a body filter card.

### Responsive breakpoints
Two mobile breakpoints are intentional; do not unify them without a product pass.

| Shell / surface | Breakpoint | Media query | Used for |
|-----------------|------------|-------------|----------|
| Marketing site (`MarketingShellComponent`) | **767px** (Tailwind `md`) | `(max-width: 767px)` | Top toolbar, mobile nav drawer |
| Public docs site (`DocumentationSiteShellComponent`) | **767px** (`md`) | `(max-width: 767px)` | Top toolbar, mobile nav drawer |
| App dashboard (`AppShellComponent`) | **1023px** | `(max-width: 1023px)` | Sidebar collapse, mobile nav |
| Docs in-app reader (`DocumentationShellComponent`) | **1023px** | `(max-width: 1023px)` | Inner sidenav drawer |

`DocumentationShellComponent` also uses **767px** for small-screen layout tweaks alongside the 1023px sidenav breakpoint.

## Forms and Filters
- Use `attachPageWorkspaceFilter()` for site/workspace scoping on list and analytics pages; do not add inline `DomainGroupSelect` filter cards in page bodies.
- Keep filter cards compact and use grid utilities for responsive layout.
- Use `FormField` only in components that bind `[formField]` in their templates.
- In `mat-form-field`, do not use the native `placeholder` attribute on `matInput` controls. Material recommends `mat-label` for the field name and `mat-hint` for examples or guidance (placeholders disappear on focus and are easy to confuse with entered values). Put optional examples in the hint, e.g. `e.g. launch`.

## Tables and Empty States
- Table components own empty-state messaging and row formatting.
- Inputs should be plain data and UI flags; child components should not access stores.
- Keep action button wiring in the table component and emit events to the page.
- Use `table-fixed` on `mat-table` so column widths stay stable across pagination; set fixed `w-[…]` on header cells for narrow/known columns (dates, IDs, actions, badges). Leave one flexible text column without a width (e.g. destination, source, email) to absorb remaining space. Use `truncate max-w-0` on data cells with long values.

## State Management
- Use `signal`, `computed`, and `effect` for local UI state.
- Keep derived data in `computed` signals to avoid recalculations in templates.
- Reset pagination and cursors on filter changes.
- Use Angular Store (`@ngrx/signals`) for server-backed list state (loading, errors, cached query results); do not keep API response arrays directly in page components.
- For cursor pagination, keep page cursor maps in component state but read page data through store selectors (`selectList`, `selectListResult`).
- After write operations that affect list results, call store invalidation (`invalidateList` or force `searchList(..., true)`) instead of mutating table arrays manually.
- Keep mutation side effects in one place: page/dialog triggers API call, then forces store refresh and clears transient UI filters/selections.

## Store Map
- Core stores live in `frontend/src/app/core/store`.
- Entity resources use `createEntityStore` (domains, domain groups, redirect rules/tests, link maps).
- Custom stores: `OrganizationUsageStore`, `OrganizationMembersStore`, `RedirectRulesAnalyticsStore`, `RedirectTestResultsStore`.
- Read data via store `searchList`/`searchDetails` (or store-specific `load...`) to leverage the shared 5-minute cache (`DEFAULT_STORE_TTL_MS`).
- For resource create/delete, enable `invalidateUsageOnMutations` in `createEntityStore` config instead of calling usage invalidation in components.
- Use manual `OrganizationUsageStore.invalidateUsage()` only for direct API writes that bypass resource entity stores.

## Error Handling
- Handle store errors in page components and show a single toast per error.
- Clear errors after displaying them to avoid repeated notifications.

## SSR and Client Routes
- Dashboard and authenticated pages must stay client-rendered.
- When adding a new authenticated route, register it in `frontend/src/app/app.routes.server.ts` with `RenderMode.Client`.
- If the route is served by the custom Node SSR server, also verify `frontend/src/server.ts` route handling (`CSR_ROUTES` and any explicit static-file routes).
- Missing SSR/CSR registration can cause server-side data calls without auth context and repeated unauthorized toasts on refresh.

## File Organization
- Place reusable UI in `frontend/src/app/shared/components`.
- Place feature-specific UI in `frontend/src/app/features/<feature>/components`.
- Keep component files focused: one component per folder with `.component.ts` and `.component.html`.

## Dependencies and lockfile — **VERY IMPORTANT**

> **WARNING:** Regenerate `package-lock.json` only with npm **10.9.4** (`packageManager` in `frontend/package.json`). Run `corepack enable`, then `npm install` in `frontend/`, or `npx -y npm@10.9.4 install`. Using another npm version can break `npm ci` in CI and in `frontend/Dockerfile`. Always commit `package-lock.json` with `package.json` changes. Full deployment notes: [Deployment.Readme.md — Frontend dependencies (npm)](../Deployment.Readme.md#frontend-dependencies-npm--very-important).
