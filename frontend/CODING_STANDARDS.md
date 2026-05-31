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

## Forms and Filters
- Use `DomainGroupSelect` for domain group filters to keep markup consistent.
- Keep filter cards compact and use grid utilities for responsive layout.
- Use `FormField` only in components that bind `[formField]` in their templates.

## Tables and Empty States
- Table components own empty-state messaging and row formatting.
- Inputs should be plain data and UI flags; child components should not access stores.
- Keep action button wiring in the table component and emit events to the page.

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
