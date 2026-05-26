import { Router } from '@angular/router';

export function getDocsRouteFragment(router: Router): string | null {
  let route = router.routerState.snapshot.root;
  while (route.firstChild) {
    route = route.firstChild;
  }

  if (route.fragment) {
    return route.fragment;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const hash = window.location.hash;
  if (hash.length <= 1) {
    return null;
  }

  return decodeURIComponent(hash.slice(1));
}
