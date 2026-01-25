import {
  Controller,
  Post,
  Body,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import * as authSchemas from '../zod-schames/auth.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { ConflictError, UnauthorizedError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clsService: ClsService,
  ) {}

  @Post('refresh')
  async refresh(
    @Body(new ZodPipe(authSchemas.RefreshTokenSchema))
    body: authSchemas.RefreshTokenDto,
  ) {
    try {
      return this.authService.refreshTokens(body.refreshToken);
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
    @Body(new ZodPipe(authSchemas.RegisterSchema))
    body: authSchemas.RegisterDto,
  ) {
    try {
      return this.authService.register(body);
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
    @Body(new ZodPipe(authSchemas.LoginSchema)) body: authSchemas.LoginDto,
  ) {
    try {
      return this.authService.login(body);
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
}
