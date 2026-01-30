import {
  Controller,
  Post,
  Get,
  Body,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Req,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import * as authSchemas from '../zod-schames/auth.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { OrganizationMembersService } from '../organization/organization-members.service';

@Controller('api/v1/auth')
export class AuthController {
  private readonly isProduction: boolean;
  private readonly refreshCookieMaxAgeMs: number;

  constructor(
    private readonly authService: AuthService,
    private readonly clsService: ClsService,
    private readonly configService: ConfigService,
    private readonly membersService: OrganizationMembersService,
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

  @Post('register-invite')
  async registerInvite(
    @Body(new ZodPipe(authSchemas.InviteRegisterSchema))
    body: authSchemas.InviteRegisterDto,
  ) {
    try {
      return await this.membersService.registerFromInvite(body);
    } catch (error) {
      if (error instanceof ConflictException) {
        return throwHttpException(
          new ConflictError({
            requestId: this.clsService.getId(),
            details: error.message,
          }),
        );
      }
      if (error instanceof ForbiddenException) {
        return throwHttpException(
          new ForbiddenError({
            requestId: this.clsService.getId(),
            details: error.message,
          }),
        );
      }
      if (error instanceof BadRequestException) {
        return throwHttpException(
          new BadRequestError({
            requestId: this.clsService.getId(),
            details: error.message,
          }),
        );
      }
      throw error;
    }
  }

  @Get('invites/lookup')
  async lookupInvite(@Query('token') token?: string) {
    const invite = await this.membersService.lookupInvite(token ?? '');
    if (!invite) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Invite link is invalid or expired.',
        }),
      );
    }
    return invite;
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

  @Post('verify-email')
  async verifyEmail(
    @Body(new ZodPipe(authSchemas.EmailVerificationSchema))
    body: authSchemas.EmailVerificationDto,
  ) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @UseGuards(AuthGuard)
  async resendVerification(@User('userId') userId: string) {
    return this.authService.resendVerification(userId);
  }

  @Post('password-reset/request')
  async requestPasswordReset(
    @Body(new ZodPipe(authSchemas.PasswordResetRequestSchema))
    body: authSchemas.PasswordResetRequestDto,
  ) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('password-reset/confirm')
  async confirmPasswordReset(
    @Body(new ZodPipe(authSchemas.PasswordResetConfirmSchema))
    body: authSchemas.PasswordResetConfirmDto,
  ) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('email-change')
  @UseGuards(AuthGuard)
  async updateEmailForUnverified(
    @User('userId') userId: string,
    @Body(new ZodPipe(authSchemas.EmailChangeRequestSchema))
    body: authSchemas.EmailChangeRequestDto,
  ) {
    return this.authService.updateEmailForUnverified(userId, body.newEmail);
  }

  @Post('email-change/request')
  @UseGuards(AuthGuard)
  async requestEmailChange(
    @User('userId') userId: string,
    @Body(new ZodPipe(authSchemas.EmailChangeRequestSchema))
    body: authSchemas.EmailChangeRequestDto,
  ) {
    return this.authService.requestEmailChange(userId, body.newEmail);
  }

  @Post('email-change/confirm')
  @UseGuards(AuthGuard)
  async confirmEmailChange(
    @User('userId') userId: string,
    @Body(new ZodPipe(authSchemas.EmailChangeConfirmSchema))
    body: authSchemas.EmailChangeConfirmDto,
  ) {
    return this.authService.confirmEmailChange(userId, body.code);
  }

  @Post('accept-legal')
  @UseGuards(AuthGuard)
  async acceptLegal(
    @User('userId') userId: string,
    @Body(new ZodPipe(authSchemas.LegalConsentSchema))
    _body: authSchemas.LegalConsentDto,
  ) {
    return this.authService.acceptLegalConsent(userId);
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
