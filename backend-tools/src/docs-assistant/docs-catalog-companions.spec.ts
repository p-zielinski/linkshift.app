import {
  enrichCatalogIdsWithDashboardCompanions,
  questionSignalsApiOnlyChannel,
  questionSignalsDashboardChannel,
} from './docs-catalog-companions';
import { DOCS_ASSISTANT_MAX_CATALOG_PICKS } from './docs-catalog-metadata';

const VALID = new Set([
  'page:guides/redirect-rules-core',
  'page:guides/redirect-rules-link-maps',
  'page:guides/redirect-rules-operations',
  'page:guides/dashboard/redirect-rules-in-dashboard',
  'openapi:redirect-rules',
]);

describe('docs-catalog-companions', () => {
  it('detects dashboard and API-only channel signals', () => {
    expect(questionSignalsDashboardChannel('How do I add a rule in the dashboard?')).toBe(true);
    expect(questionSignalsApiOnlyChannel('create via API with curl')).toBe(true);
    expect(questionSignalsApiOnlyChannel('How do I create a redirect rule for one path?')).toBe(false);
  });

  it('prepends dashboard redirect guide when router picked API guides but omitted dashboard', () => {
    const routerPicks = [
      'page:guides/redirect-rules-core',
      'page:guides/redirect-rules-link-maps',
      'page:guides/redirect-rules-operations',
    ];

    const enriched = enrichCatalogIdsWithDashboardCompanions(
      'How do I create a redirect rule for one path? In the dashboard',
      routerPicks,
      VALID,
      DOCS_ASSISTANT_MAX_CATALOG_PICKS,
    );

    expect(enriched[0]).toBe('page:guides/dashboard/redirect-rules-in-dashboard');
    expect(enriched).toEqual(expect.arrayContaining(routerPicks));
  });

  it('does not inject dashboard companions for API-only questions', () => {
    const routerPicks = ['page:guides/redirect-rules-core', 'openapi:redirect-rules'];

    const enriched = enrichCatalogIdsWithDashboardCompanions(
      'POST /api/v1/redirect-rules request body for exact path',
      routerPicks,
      VALID,
      DOCS_ASSISTANT_MAX_CATALOG_PICKS,
    );

    expect(enriched).toEqual(routerPicks);
  });

  it('skips injection when dashboard guide is already selected', () => {
    const routerPicks = [
      'page:guides/dashboard/redirect-rules-in-dashboard',
      'page:guides/redirect-rules-core',
    ];

    const enriched = enrichCatalogIdsWithDashboardCompanions(
      'create a rule in the dashboard',
      routerPicks,
      VALID,
      DOCS_ASSISTANT_MAX_CATALOG_PICKS,
    );

    expect(enriched).toEqual(routerPicks);
  });
});
