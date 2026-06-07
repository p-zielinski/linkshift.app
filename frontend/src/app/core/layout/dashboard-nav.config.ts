import type { IsActiveMatchOptions } from '@angular/router';

export type NavItem = {
  label: string;
  route: string;
  icon: string;
  requiresDomainGroups?: boolean;
  matchSubRoutes?: boolean;
  openInNewTab?: boolean;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

/** Path-based active state; ignores query params so deep-linked analytics stays highlighted. */
export function sidebarNavLinkActiveOptions(matchSubRoutes = false): IsActiveMatchOptions {
  return {
    paths: matchSubRoutes ? 'subset' : 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };
}

export const CAMPAIGN_NAV_ITEMS: NavItem[] = [
  { label: 'Overview', route: '/overview', icon: 'home' },
  { label: 'Links', route: '/links', icon: 'link' },
  { label: 'Analytics', route: '/analytics', icon: 'analytics' },
  { label: 'QR & Tools', route: '/tools', icon: 'construction', matchSubRoutes: true },
  { label: 'Settings', route: '/settings', icon: 'settings' },
];

export const ADVANCED_NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
      { label: 'Links', route: '/links', icon: 'link', requiresDomainGroups: true },
      {
        label: 'Analytics',
        route: '/redirect-rules-analytics',
        icon: 'analytics',
        requiresDomainGroups: true,
      },
    ],
  },
  {
    label: 'Routing',
    items: [
      { label: 'Domain Groups', route: '/domain-groups', icon: 'layers' },
      { label: 'Domains', route: '/domains', icon: 'public', requiresDomainGroups: true },
      {
        label: 'Subdomains',
        route: '/subdomains',
        icon: 'alternate_email',
        requiresDomainGroups: true,
      },
      {
        label: 'Redirect Rules',
        route: '/redirect-rules',
        icon: 'swap_horiz',
        requiresDomainGroups: true,
      },
      {
        label: 'Link Maps',
        route: '/link-maps',
        icon: 'map',
        requiresDomainGroups: true,
        matchSubRoutes: true,
      },
    ],
  },
  {
    label: 'Quality',
    items: [
      { label: 'Tests', route: '/tests', icon: 'science', requiresDomainGroups: true },
      { label: 'Tools', route: '/tools', icon: 'construction', matchSubRoutes: true },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Organization', route: '/organization', icon: 'groups', matchSubRoutes: true },
      { label: 'Plan and account', route: '/settings', icon: 'settings' },
    ],
  },
  {
    label: 'Help',
      items: [
        {
          label: 'Docs',
          route: '/docs',
          icon: 'description',
          matchSubRoutes: true,
          openInNewTab: true,
        },
      ],
  },
];
