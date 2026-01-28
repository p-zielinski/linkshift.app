import {
  Controller,
  Post,
  Body,
  ConflictException,
  UnauthorizedException,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import * as authSchemas from '../zod-schames/auth.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { ConflictError, UnauthorizedError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('api/v1/auth')
export class AuthController {
  private readonly isProduction: boolean;
  private readonly refreshCookieMaxAgeMs: number;

  constructor(
    private readonly authService: AuthService,
    private readonly clsService: ClsService,
    private readonly configService: ConfigService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    this.isProduction = nodeEnv === 'production';
    this.refreshCookieMaxAgeMs = this.getRefreshCookieMaxAgeMs(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    );
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body(new ZodPipe(authSchemas.RefreshTokenSchema))
    body: authSchemas.RefreshTokenDto,
  ) {
    try {
      const refreshToken =
        body.refreshToken ?? this.getCookie(request, 'refresh_token');

      if (!refreshToken) {
        return throwHttpException(
          new UnauthorizedError({
            requestId: this.clsService.getId(),
            details: 'Refresh token is required',
          }),
        );
      }

      const tokens = await this.authService.refreshTokens(refreshToken);
      this.setRefreshCookie(response, tokens.refreshToken);
      return { accessToken: tokens.accessToken };
    } catch {
      return throwHttpException(
        new UnauthorizedError({
          requestId: this.clsService.getId(),
          details: 'Invalid refresh token',
        }),
      );
    }
  }

  @Post('register')
  async register(
    @Res({ passthrough: true }) response: Response,
    @Body(new ZodPipe(authSchemas.RegisterSchema))
    body: authSchemas.RegisterDto,
  ) {
    try {
      const result = await this.authService.register(body);
      this.setRefreshCookie(response, result.refreshToken);
      const { refreshToken, ...rest } = result;
      return rest;
    } catch (error) {
      if (error instanceof ConflictException) {
        return throwHttpException(
          new ConflictError({
            requestId: this.clsService.getId(),
            details: error.message,
          }),
        );
      }
      throw error;
    }
  }

  @Post('login')
  async login(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body(new ZodPipe(authSchemas.LoginSchema)) body: authSchemas.LoginDto,
  ) {
    try {
      const clientIp = this.getClientIp(request);
      const result = await this.authService.login(body, clientIp);
      this.setRefreshCookie(response, result.refreshToken);
      const { refreshToken, ...rest } = result;
      return rest;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return throwHttpException(
          new UnauthorizedError({
            requestId: this.clsService.getId(),
            details: error.message,
          }),
        );
      }
      throw error;
    }
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.getCookie(request, 'refresh_token');
    await this.authService.logout(refreshToken);
    this.clearRefreshCookie(response);
    return { success: true };
  }

  private setRefreshCookie(response: Response, refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    response.setHeader('Cache-Control', 'no-store');
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: this.refreshCookieMaxAgeMs,
    });
  }

  private clearRefreshCookie(response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
    });
  }

  private getRefreshCookieMaxAgeMs(raw: string | undefined | null): number {
    if (!raw) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const match = raw.trim().match(/^(\d+)([smhd])$/i);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === 's') {
      return value * 1000;
    }
    if (unit === 'm') {
      return value * 60 * 1000;
    }
    if (unit === 'h') {
      return value * 60 * 60 * 1000;
    }
    return value * 24 * 60 * 60 * 1000;
  }

  private getCookie(request: Request, name: string): string | null {
    const header = request.headers.cookie;
    if (!header) {
      return null;
    }

    const cookies = header.split(';').map((entry) => entry.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${name}=`)) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }

    return null;
  }

  private getClientIp(request: Request): string | null {
    return request.ip ?? request.socket?.remoteAddress ?? null;
  }
}
