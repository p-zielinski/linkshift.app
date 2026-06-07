import {
  selectSiteInHeaderMenuCopy,
  selectSiteInHeaderMenuToPreviewTestsCopy,
  switchSiteOrAllSitesCopy,
} from './page-workspace-empty-state.copy';

describe('page-workspace-empty-state.copy', () => {
  it('builds select-site copy for each scoped resource', () => {
    expect(selectSiteInHeaderMenuCopy('redirect rules')).toBe(
      'Choose a site in the page header Site menu to view redirect rules.',
    );
    expect(selectSiteInHeaderMenuCopy('link maps')).toBe(
      'Choose a site in the page header Site menu to view link maps.',
    );
    expect(selectSiteInHeaderMenuCopy('tests')).toBe(
      'Choose a site in the page header Site menu to view tests.',
    );
  });

  it('builds preview-tests copy for the redirect tests summary card', () => {
    expect(selectSiteInHeaderMenuToPreviewTestsCopy()).toBe(
      'Choose a site in the page header Site menu to preview tests.',
    );
  });

  it('builds switch-site copy when a filtered site has no rows', () => {
    expect(switchSiteOrAllSitesCopy()).toBe(
      'Switch site in the page header Site menu, or choose All sites, to see everything.',
    );
  });
});
