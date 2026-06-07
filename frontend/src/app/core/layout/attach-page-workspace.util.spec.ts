import { resolvePageWorkspaceAllowAllSites } from './attach-page-workspace.util';

describe('resolvePageWorkspaceAllowAllSites', () => {
  it('returns false when only one group exists', () => {
    expect(
      resolvePageWorkspaceAllowAllSites({
        groupCount: 1,
        isCampaignMode: true,
        allowEmptySelection: true,
      }),
    ).toBe(false);
  });

  it('defaults to true in campaign mode when allowEmptySelection is omitted', () => {
    expect(
      resolvePageWorkspaceAllowAllSites({
        groupCount: 2,
        isCampaignMode: true,
        allowEmptySelection: undefined,
      }),
    ).toBe(true);
  });

  it('defaults to false in advanced mode when allowEmptySelection is omitted', () => {
    expect(
      resolvePageWorkspaceAllowAllSites({
        groupCount: 2,
        isCampaignMode: false,
        allowEmptySelection: undefined,
      }),
    ).toBe(false);
  });

  it('allows all sites on /links in advanced when the page opts in', () => {
    expect(
      resolvePageWorkspaceAllowAllSites({
        groupCount: 2,
        isCampaignMode: false,
        allowEmptySelection: true,
      }),
    ).toBe(true);
  });

  it('keeps other advanced pages on a single-site selection', () => {
    expect(
      resolvePageWorkspaceAllowAllSites({
        groupCount: 2,
        isCampaignMode: false,
        allowEmptySelection: false,
      }),
    ).toBe(false);
  });
});
