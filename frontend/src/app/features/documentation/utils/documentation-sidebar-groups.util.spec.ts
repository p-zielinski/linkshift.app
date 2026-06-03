import { DOCUMENTATION_MARKDOWN_PAGES } from '../generated/documentation.generated';
import { buildDocumentationSidebarNavGroups } from './documentation-sidebar-groups.util';

describe('buildDocumentationSidebarNavGroups', () => {
  it('places sidebar pages into thematic groups without duplicates', () => {
    const groups = buildDocumentationSidebarNavGroups(DOCUMENTATION_MARKDOWN_PAGES);
    const sidebarExcluded = new Set(['overview', 'overview-faq', 'what-is-linkshift']);
    const expectedSlugs = DOCUMENTATION_MARKDOWN_PAGES.filter(
      (page) => !sidebarExcluded.has(page.slug),
    ).map((page) => page.slug);

    const groupedSlugs = groups.flatMap((group) => group.pages.map((page) => page.slug));
    expect(new Set(groupedSlugs).size).toBe(groupedSlugs.length);
    expect(groupedSlugs.sort()).toEqual(expectedSlugs.sort());
  });

  it('groups dashboard guides under Dashboard', () => {
    const groups = buildDocumentationSidebarNavGroups(DOCUMENTATION_MARKDOWN_PAGES);
    const dashboard = groups.find((group) => group.id === 'dashboard');

    expect(dashboard?.pages.map((page) => page.slug)).toEqual(
      expect.arrayContaining([
        'dashboard-overview',
        'redirect-rules-in-dashboard',
        'billing-and-plans-in-dashboard',
      ]),
    );
  });

  it('keeps redirect engine depth guides together', () => {
    const groups = buildDocumentationSidebarNavGroups(DOCUMENTATION_MARKDOWN_PAGES);
    const redirectEngine = groups.find((group) => group.id === 'redirect-engine');

    expect(redirectEngine?.pages.map((page) => page.slug)).toEqual(
      expect.arrayContaining([
        'redirect-rules-core',
        'redirect-rules-recipes',
        'link-map-entries',
        'redirect-tests',
      ]),
    );
  });

  it('excludes overview and intro pages from sidebar groups', () => {
    const groups = buildDocumentationSidebarNavGroups(DOCUMENTATION_MARKDOWN_PAGES);
    const groupedSlugs = groups.flatMap((group) => group.pages.map((page) => page.slug));

    expect(groupedSlugs).not.toContain('overview');
    expect(groupedSlugs).not.toContain('what-is-linkshift');
  });

  it('keeps overview-faq out of the sidebar (linked from FAQ index only)', () => {
    const groups = buildDocumentationSidebarNavGroups(DOCUMENTATION_MARKDOWN_PAGES);
    const groupedSlugs = groups.flatMap((group) => group.pages.map((page) => page.slug));

    expect(groupedSlugs).not.toContain('overview-faq');
  });
});
