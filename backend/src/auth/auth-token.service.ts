import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';
import { Logger } from 'nestjs-pino';

export type AuthTokenPayload = {
  userId: string;
  email?: string;
  newEmail?: string;
};

@Injectable()
export class AuthTokenService {
  private readonly tokenTtlSeconds = 30 * 60;

  constructor(
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {
  }

  async createToken(
    purpose: string,
    payload: AuthTokenPayload,
  ): Promise<string> {
    const token =
      crypto.randomUUID().replace(/-/g, '') +
      crypto.randomUUID().replace(/-/g, '');
    const key = this.buildKey(purpose, token);
    await this.redisService.set(key, payload, this.tokenTtlSeconds);
    return token;
  }

  async createCode(
    purpose: string,
    payload: AuthTokenPayload,
  ): Promise<string> {
    const code = this.generateCode();
    const key = this.buildKey(purpose, code);
    await this.redisService.set(key, payload, this.tokenTtlSeconds);
    return code;
  }

  async consumeToken(
    purpose: string,
    token: string,
  ): Promise<AuthTokenPayload | null> {
    if (!token) {
      return null;
    }
    const key = this.buildKey(purpose, token);
    const payload = await this.redisService.get<AuthTokenPayload>(key);
    if (!payload) {
      return null;
    }
    await this.redisService.del(key);
    return payload;
  }

  private buildKey(purpose: string, raw: string): string {
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `AUTH_TOKEN:${purpose}:${hash}`;
  }

  private generateCode(): string {
    const value = crypto.randomInt(0, 1_000_000);
    return value.toString().padStart(6, '0');
  }
}
