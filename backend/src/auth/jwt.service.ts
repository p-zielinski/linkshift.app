import { Injectable } from '@nestjs/common';
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

  generateTokens(payload: JwtPayload): Tokens {
    const accessTokenSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'default-secret-change-me';
    const accessTokenExpiresIn = '15m';

    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'default-refresh-secret-change-me';
    const refreshTokenExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: accessTokenExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: refreshTokenExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') ||
        'default-secret-change-me';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const secret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'default-refresh-secret-change-me';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
