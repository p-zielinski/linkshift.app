import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Logger } from 'nestjs-pino';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor(
    configService: ConfigService,
    private readonly logger: Logger,
  ) {
    // 1. Get the DATABASE_URL using ConfigService to ensure env vars are loaded
    const url = configService.get<string>('DATABASE_URL');

    if (!url) {
      logger.error('DATABASE_URL is missing', {
        hint: 'Check your .env file',
      });
    } else {
      // 2. Log the URL (masking the password) to verify it's correct
      const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
      logger.log('Initializing Prisma adapter', { url: maskedUrl });
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
      this.logger.log('Connecting to database');
      await this.$connect();
      this.logger.log('Connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting from database');
      await this.$disconnect();
      await this.pool.end();
    } catch (error) {
      this.logger.error('Failed to disconnect from database', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    }
  }

  async checkHealth(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }
}
