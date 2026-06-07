import {
  resolveCampaignHomeRecentLinksLoading,
  shouldFetchCampaignHomeRecentLinks,
  shouldShowCampaignHomeRecentLinksEmpty,
  shouldShowCampaignHomeRecentLinksLoadFailed,
} from './campaign-home-recent-links-loading.util';

describe('resolveCampaignHomeRecentLinksLoading', () => {
  const baseParams = {
    usageLoading: false,
    domainGroupsLoading: false,
    linkMapEntryCount: 3,
    linksListLoaded: true,
  };

  it('waits for usage and domain groups before deciding empty vs loading', () => {
    expect(
      resolveCampaignHomeRecentLinksLoading({
        ...baseParams,
        usageLoading: true,
      }),
    ).toBe(true);

    expect(
      resolveCampaignHomeRecentLinksLoading({
        ...baseParams,
        domainGroupsLoading: true,
      }),
    ).toBe(true);
  });

  it('does not show loading when organization has no link map entries', () => {
    expect(
      resolveCampaignHomeRecentLinksLoading({
        ...baseParams,
        linkMapEntryCount: 0,
      }),
    ).toBe(false);
  });

  it('waits for the aggregated links list before showing recent links', () => {
    expect(
      resolveCampaignHomeRecentLinksLoading({
        ...baseParams,
        linksListLoaded: false,
      }),
    ).toBe(true);
  });

  it('does not block on background refreshes when cached list data already exists', () => {
    expect(resolveCampaignHomeRecentLinksLoading(baseParams)).toBe(false);
  });
});

describe('shouldFetchCampaignHomeRecentLinks', () => {
  it('skips fetch when organization has no link map entries', () => {
    expect(
      shouldFetchCampaignHomeRecentLinks({
        hasLinkMapEntries: false,
        listResult: null,
        expiration: null,
      }),
    ).toBe(false);
  });

  it('fetches when entries exist but list cache is missing', () => {
    expect(
      shouldFetchCampaignHomeRecentLinks({
        hasLinkMapEntries: true,
        listResult: null,
        expiration: null,
      }),
    ).toBe(true);
  });

  it('does not refetch when cached list is still valid', () => {
    expect(
      shouldFetchCampaignHomeRecentLinks({
        hasLinkMapEntries: true,
        listResult: { data: ['link-1'], hasMore: false },
        expiration: Date.now() + 60_000,
      }),
    ).toBe(false);
  });

  it('refetches when cached list is expired', () => {
    expect(
      shouldFetchCampaignHomeRecentLinks({
        hasLinkMapEntries: true,
        listResult: { data: ['link-1'], hasMore: false },
        expiration: Date.now() - 1,
      }),
    ).toBe(true);
  });
});

describe('shouldShowCampaignHomeRecentLinksLoadFailed', () => {
  const baseParams = {
    hasLinkMapEntries: true,
    linksListLoaded: true,
    linksListEmpty: true,
    fetchFailed: true,
  };

  it('shows load failed when entries exist but cached list is empty after failure', () => {
    expect(shouldShowCampaignHomeRecentLinksLoadFailed(baseParams)).toBe(true);
  });

  it('does not show load failed while list is still loading', () => {
    expect(
      shouldShowCampaignHomeRecentLinksLoadFailed({
        ...baseParams,
        linksListLoaded: false,
      }),
    ).toBe(false);
  });

  it('does not show load failed when organization has no link map entries', () => {
    expect(
      shouldShowCampaignHomeRecentLinksLoadFailed({
        ...baseParams,
        hasLinkMapEntries: false,
      }),
    ).toBe(false);
  });

  it('does not show load failed when recent links loaded successfully', () => {
    expect(
      shouldShowCampaignHomeRecentLinksLoadFailed({
        ...baseParams,
        linksListEmpty: false,
        fetchFailed: false,
      }),
    ).toBe(false);
  });
});

describe('shouldShowCampaignHomeRecentLinksEmpty', () => {
  it('shows empty state when list loaded with no rows and no failure', () => {
    expect(
      shouldShowCampaignHomeRecentLinksEmpty({
        recentLinksLoading: false,
        linksListEmpty: true,
        fetchFailed: false,
      }),
    ).toBe(true);
  });

  it('does not show empty state when fetch failed', () => {
    expect(
      shouldShowCampaignHomeRecentLinksEmpty({
        recentLinksLoading: false,
        linksListEmpty: true,
        fetchFailed: true,
      }),
    ).toBe(false);
  });

  it('does not show empty state while loading', () => {
    expect(
      shouldShowCampaignHomeRecentLinksEmpty({
        recentLinksLoading: true,
        linksListEmpty: true,
        fetchFailed: false,
      }),
    ).toBe(false);
  });
});
