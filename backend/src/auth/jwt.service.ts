import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  organizationId: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  private getConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      // Logic: It is better to crash the app than to run with insecure defaults
      throw new InternalServerErrorException(
        `Configuration error: ${key} is missing`,
      );
    }
    return value;
  }

  generateTokens(payload: JwtPayload): Tokens {
    const accessTokenSecret = this.getConfig('JWT_SECRET');
    const refreshTokenSecret = this.getConfig('JWT_REFRESH_SECRET');

    const accessTokenExpiresIn = '15m'; // Ideally, this should also be in Config
    const refreshTokenExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const refreshTokenId = crypto.randomUUID();

    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: accessTokenExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { ...payload, jti: refreshTokenId },
      refreshTokenSecret,
      {
        expiresIn: refreshTokenExpiresIn,
      } as jwt.SignOptions,
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const secret = this.getConfig('JWT_SECRET');
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error: unknown) {
      return null;
    }
  }

  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const secret = this.getConfig('JWT_REFRESH_SECRET');
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error: unknown) {
      return null;
    }
  }
}
