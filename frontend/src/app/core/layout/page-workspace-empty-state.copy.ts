export type PageWorkspaceResource = 'redirect rules' | 'link maps' | 'tests';

/** No site selected — scoped pages require a single site from the page header Site menu. */
export function selectSiteInHeaderMenuCopy(resource: PageWorkspaceResource): string {
  return `Choose a site in the page header Site menu to view ${resource}.`;
}

export function selectSiteInHeaderMenuToPreviewTestsCopy(): string {
  return 'Choose a site in the page header Site menu to preview tests.';
}

/** Site selected but list empty while the organization has data in other sites. */
export function switchSiteOrAllSitesCopy(): string {
  return 'Switch site in the page header Site menu, or choose All sites, to see everything.';
}
