# Frontend Coding Standards

## Component Architecture
- Keep page components thin: state management, dialog orchestration, and store wiring only.
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

## Error Handling
- Handle store errors in page components and show a single toast per error.
- Clear errors after displaying them to avoid repeated notifications.

## File Organization
- Place reusable UI in `frontend/src/app/shared/components`.
- Place feature-specific UI in `frontend/src/app/features/<feature>/components`.
- Keep component files focused: one component per folder with `.component.ts` and `.component.html`.
