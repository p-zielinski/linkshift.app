import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor(configService: ConfigService) {
    // 1. Get the DATABASE_URL using ConfigService to ensure env vars are loaded
    const url = configService.get<string>('DATABASE_URL');

    if (!url) {
      Logger.error(
        'DATABASE_URL is NOT defined! Check your .env file.',
        'PrismaService',
      );
    } else {
      // 2. Log the URL (masking the password) to verify it's correct
      const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
      Logger.log(
        `Initializing Prisma Adapter with URL: ${maskedUrl}`,
        'PrismaService',
      );
    }

    // 3. Initialize the PostgreSQL adapter
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);

    // 4. Pass the adapter to the PrismaClient constructor
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      this.logger.log('Attempting to connect to the database...');
      await this.$connect();
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      this.logger.error('Failed to connect to the database!', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting from the database...');
      await this.$disconnect();
      await this.pool.end();
    } catch (error) {
      this.logger.error('Failed to disconnect from the database!', error);
    }
  }
}
