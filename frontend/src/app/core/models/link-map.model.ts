export type LinkMapQueryMatch = 'exact' | 'ignore' | 'subset';

export type LinkMap = {
  id: string;
  name: string;
  domainGroupId: string;
  caseSensitive: boolean;
  queryMatch: LinkMapQueryMatch;
  fallbackDestination?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type LinkMapEntry = {
  id: string;
  key: string;
  destination: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateLinkMapDto = {
  name: string;
  domainGroupId: string;
  caseSensitive?: boolean;
  queryMatch?: LinkMapQueryMatch;
  fallbackDestination?: string | null;
  entries?: Array<{ key: string; destination: string }>;
};

export type UpdateLinkMapDto = {
  name?: string;
  caseSensitive?: boolean;
  queryMatch?: LinkMapQueryMatch;
  fallbackDestination?: string | null;
};

export type LinkMapListQuery = {
  domainGroupId: string;
};

export type UpsertLinkMapEntriesDto = {
  mode?: 'upsert' | 'replace';
  entries: Array<{ key: string; destination: string }>;
};

export type DeleteLinkMapEntriesDto = {
  keys: string[];
};

export type LinkMapWithEntries = LinkMap & {
  entries: LinkMapEntry[];
};
