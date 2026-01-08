import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Req,
  Res,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import express from 'express';
import { ConfigService } from '@nestjs/config';
import { RedirectService } from '../redirect.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import {
  CreateRedirectRuleSchema,
  UpdateRedirectRuleSchema,
} from '../zod-schames/redirect-rule.schemas';

@Controller('api/v1/redirect-rules')
export class RedirectRulesController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const domainGroupId = req.query.domainGroupId as string;
    const rules = await this.redirectService.listRules(
      organizationId,
      domainGroupId,
    );

    return res.json({
      success: true,
      data: rules,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      const rule = await this.redirectService.getRuleById(id, organizationId);
      return res.json({ success: true, data: rule });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(404)
          .json({ success: false, error: error.message, statusCode: 404 });
      }
      throw error;
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User('organizationId') organizationId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    // Validate request schema
    const validation = CreateRedirectRuleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const result = await this.redirectService.createRule(
        organizationId,
        validation.data,
      );
      return res.status(201).json({
        success: true,
        data: result.rule,
        warnings: result.warnings,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(404)
          .json({ success: false, error: error.message, statusCode: 404 });
      }
      if (error instanceof BadRequestException) {
        const response = error.getResponse() as any;
        return res.status(400).json({
          success: false,
          error: response.message || 'Error',
          details: response.details,
          warnings: response.warnings,
          statusCode: 400,
        });
      }
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const validation = UpdateRedirectRuleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const result = await this.redirectService.updateRule(
        id,
        organizationId,
        validation.data,
      );
      return res.json({
        success: true,
        data: result.rule,
        warnings: result.warnings,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(404)
          .json({ success: false, error: error.message, statusCode: 404 });
      }
      if (error instanceof BadRequestException) {
        const response = error.getResponse() as any;
        return res.status(400).json({
          success: false,
          error: response.message || 'Error',
          details: response.details,
          warnings: response.warnings,
          statusCode: 400,
        });
      }
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      await this.redirectService.deleteRule(id, organizationId);
      return res.json({
        success: true,
        message: 'Redirect rule deleted successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(404)
          .json({ success: false, error: error.message, statusCode: 404 });
      }
      throw error;
    }
  }
}
