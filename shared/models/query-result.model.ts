import { DataType } from '../../backend/src/cache/cache-manager.service';

export class QueryResult<T> {
  dataType: DataType;
  data: T[];
  hasMore: boolean;
  moreStartingAfterId?: string;

  constructor(params: Omit<QueryResult<T>, 'hasMore'>) {
    Object.assign(this, params);
    this.hasMore = !!params.moreStartingAfterId;
  }
}
