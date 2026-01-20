import { Injectable } from '@nestjs/common';
import { CachedByProperty, DataType } from './cache-manager.service';

@Injectable()
export class CacheManagerIdsService {
  getSimpleCacheManageId({
    dataType,
    properties,
  }: {
    dataType: DataType;
    properties: Partial<Record<CachedByProperty, string>>;
  }): string {
    const propsString = Object.entries(properties)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join(':');
    return `entity:${dataType}:${propsString}`;
  }
}
