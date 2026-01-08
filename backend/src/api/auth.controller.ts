import {
  Controller,
  Post,
  Req,
  Res,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import express from 'express';
import { ConfigService } from '@nestjs/config';
import { RedirectService } from '../redirect.service';
import { AuthService } from '../auth/auth.service';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
} from '../zod-schames/auth.schemas';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redirectService: RedirectService,
    private readonly configService: ConfigService,
  ) {}

  @Post('refresh')
  async refresh(@Req() req: express.Request, @Res() res: express.Response) {
    // Validate request body
    const validation = RefreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const tokens = await this.authService.refreshTokens(
        validation.data.refreshToken,
      );
      return res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        statusCode: 401,
      });
    }
  }

  @Post('register')
  async register(@Req() req: express.Request, @Res() res: express.Response) {
    // Validate request body
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const result = await this.authService.register(validation.data);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        return res.status(409).json({
          success: false,
          error: error.message,
          statusCode: 409,
        });
      }
      throw error;
    }
  }

  @Post('login')
  async login(@Req() req: express.Request, @Res() res: express.Response) {
    // Validate request body
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const result = await this.authService.login(validation.data);

      return res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({
          success: false,
          error: error.message,
          statusCode: 401,
        });
      }
      throw error;
    }
  }
}
