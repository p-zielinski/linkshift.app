import { ActivatedRouteSnapshot, Router } from '@angular/router';
import {
  extractDocsFragmentFromHref,
  findFragmentInRouteTree,
  getDocsFragmentFromUrl,
  getDocsNavigationFragment,
  getDocsRouteFragment,
} from './docs-route-fragment.util';

describe('getDocsRouteFragment', () => {
  it('extracts fragment from navigation url', () => {
    expect(getDocsFragmentFromUrl('/docs/guides/redirect-rules#simulate-before-rollout')).toBe(
      'simulate-before-rollout',
    );
    expect(getDocsFragmentFromUrl('/docs/guides/redirect-rules')).toBeNull();
  });

  it('prefers navigation url over stale window hash', () => {
    const router = {
      routerState: {
        snapshot: {
          root: { firstChild: null, fragment: null },
        },
      },
      url: '/docs/guides/link-maps',
      parseUrl: (url: string) => ({ fragment: url.includes('#') ? 'old' : null }),
    } as unknown as Router;

    window.location.hash = '#old-anchor';

    expect(getDocsNavigationFragment(router, '/docs/guides/link-maps')).toBeNull();
  });

  it('extracts fragment from href strings', () => {
    expect(extractDocsFragmentFromHref('#simulate-before-rollout')).toBe(
      'simulate-before-rollout',
    );
    expect(
      extractDocsFragmentFromHref(
        '/docs/concepts/redirect-engine-concepts#functions-in-conditions-no-curly-braces',
      ),
    ).toBe('functions-in-conditions-no-curly-braces');
  });

  it('reads fragment from any level in the activated route tree', () => {
    const leaf = { firstChild: null, fragment: null } as ActivatedRouteSnapshot;
    const parent = {
      firstChild: leaf,
      fragment: 'link-maps--redirect-rules',
    } as ActivatedRouteSnapshot;

    expect(findFragmentInRouteTree(parent)).toBe('link-maps--redirect-rules');
  });

  it('reads fragment from window.location.hash when router.url omits it', () => {
    const router = {
      routerState: {
        snapshot: {
          root: { firstChild: null, fragment: null },
        },
      },
      url: '/docs/concepts/redirect-engine-concepts',
      parseUrl: () => ({ fragment: null }),
    } as unknown as Router;

    window.location.hash = '#conditional-routing-syntax';

    expect(getDocsRouteFragment(router)).toBe('conditional-routing-syntax');
  });
});
