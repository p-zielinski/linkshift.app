export type LinkMapQueryMatch = 'exact' | 'ignore' | 'subset';

export type LinkMap = {
  id: string;
  name: string;
  domainGroupId: string;
  caseSensitive: boolean;
  queryMatch: LinkMapQueryMatch;
  fallbackDestination?: string | null;
  entriesCount: number;
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

export type LinkMapEntry = {
  id: string;
  linkMapId: string;
  key: string;
  destination: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type LinkMapEntryListQuery = {
  linkMapId: string;
  limit?: number;
  startAfterId?: string;
  search?: string;
};

export type CreateLinkMapEntryDto = {
  linkMapId: string;
  key: string;
  destination: string;
};

export type UpdateLinkMapEntryDto = {
  key?: string;
  destination?: string;
};

export type DeleteLinkMapEntriesByIdDto = {
  linkMapId: string;
  entryIds: string[];
};

export type ImportLinkMapEntriesDto = {
  linkMapId: string;
  entries: Array<{ key: string; destination: string }>;
};

export type ImportLinkMapEntriesError = {
  index: number;
  key: string;
  destination: string;
  error: string;
};

export type ImportLinkMapEntriesResult = {
  total: number;
  importedCount: number;
  failedCount: number;
  importedEntryIds: string[];
  errors: ImportLinkMapEntriesError[];
};

export type RollbackImportedLinkMapEntriesDto = {
  linkMapId: string;
  entryIds: string[];
};
