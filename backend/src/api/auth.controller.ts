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
import {
  ConflictError,
  throwHttpException,
  UnauthorizedError,
} from '../models/error.model';
import { ClsService } from 'nestjs-cls';

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
      const tokens = await this.authService.refreshTokens(body.refreshToken);
      return {
        success: true,
        data: tokens,
      };
    } catch (_) {
      throwHttpException(
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
      const result = await this.authService.register(body);

      return {
        success: true,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throwHttpException(
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
      const result = await this.authService.login(body);

      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throwHttpException(
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
