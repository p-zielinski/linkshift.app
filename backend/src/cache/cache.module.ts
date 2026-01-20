import { Module, Global } from '@nestjs/common';
import { CacheManagerService } from './cache-manager.service';
import { CacheManagerIdsService } from './cache-manager-ids.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [CacheManagerService, CacheManagerIdsService],
  exports: [CacheManagerService, CacheManagerIdsService],
})
export class CacheModule {}
