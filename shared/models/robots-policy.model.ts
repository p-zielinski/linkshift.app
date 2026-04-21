export const ROBOTS_POLICY_VALUES = [
  'NONE',
  'ALLOW_ALL',
  'DISALLOW_ALL',
  'DISALLOW_BAD_BOTS',
  'CUSTOM',
] as const;

export type RobotsPolicy = (typeof ROBOTS_POLICY_VALUES)[number];

export const DEFAULT_ROBOTS_POLICY: RobotsPolicy = 'NONE';

export const MAX_CUSTOM_ROBOTS_CONTENT_LENGTH = 4096;

export const ROBOTS_ALLOW_ALL_CONTENT = 'User-agent: *\nAllow: /';
export const ROBOTS_DISALLOW_ALL_CONTENT = 'User-agent: *\nDisallow: /';

export const ROBOTS_DISALLOW_BAD_BOTS_CONTENT = [
  'User-agent: AhrefsBot',
  'Disallow: /',
  '',
  'User-agent: SemrushBot',
  'Disallow: /',
  '',
  'User-agent: MJ12bot',
  'Disallow: /',
  '',
  'User-agent: DotBot',
  'Disallow: /',
  '',
  'User-agent: BLEXBot',
  'Disallow: /',
  '',
  'User-agent: PetalBot',
  'Disallow: /',
  '',
  'User-agent: Bytespider',
  'Disallow: /',
  '',
  'User-agent: CCBot',
  'Disallow: /',
  '',
  'User-agent: ZoominfoBot',
  'Disallow: /',
  '',
  'User-agent: DataForSeoBot',
  'Disallow: /',
].join('\n');
