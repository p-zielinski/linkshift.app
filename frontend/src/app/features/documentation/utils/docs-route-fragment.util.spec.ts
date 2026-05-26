import { Router } from '@angular/router';
import { getDocsRouteFragment } from './docs-route-fragment.util';

describe('getDocsRouteFragment', () => {
  it('reads fragment from window.location.hash when router.url omits it', () => {
    const router = {
      routerState: {
        snapshot: {
          root: { firstChild: null, fragment: null },
        },
      },
      url: '/docs/concepts/redirect-engine-concepts',
    } as unknown as Router;

    window.location.hash = '#conditional-routing-syntax';

    expect(getDocsRouteFragment(router)).toBe('conditional-routing-syntax');
  });
});
