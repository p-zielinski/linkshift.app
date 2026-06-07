/**
 * Canonical `.app-page-host` layout rules — keep in sync with `frontend/src/styles.scss`.
 * Angular renders routed components as siblings of `router-outlet`, not inside it.
 */
export const APP_PAGE_HOST_LAYOUT_CONTRACT = {
  outletSelector: '.app-page-host > router-outlet',
  routedChildSelector: '.app-page-host > :not(router-outlet)',
  /** Do not use — styles the outlet and breaks the flex height chain. */
  forbiddenSelector: '.app-page-host > *',
  outletDisplay: 'display: none',
  routedFlex: 'flex: 1 1 0',
} as const;
