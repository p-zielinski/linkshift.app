export type QueryResult<T> = {
  dataType?: string;
  data: T[];
  hasMore: boolean;
  moreStartingAfterId?: string;
};
