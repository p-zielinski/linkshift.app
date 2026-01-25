export type QueryResult<T> = {
  dataType: DataObjectKey;
  data: T[];
  hasMore?: boolean;
  total: number;

};
