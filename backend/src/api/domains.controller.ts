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
  ConflictException,
} from '@nestjs/common';
import express from 'express';
import { ConfigService } from '@nestjs/config';
import { RedirectService } from '../redirect.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import {
  CreateDomainSchema,
  UpdateDomainSchema,
} from '../zod-schames/domain.schemas';

@Controller('api/v1/domains')
export class DomainsController {
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
    const domains = await this.redirectService.listDomains(organizationId);

    return res.json({
      success: true,
      data: domains,
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
      const domain = await this.redirectService.getDomainById(
        id,
        organizationId,
      );
      return res.json({ success: true, data: domain });
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
    // Validate request body
    const validation = CreateDomainSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const domain = await this.redirectService.createDomain(
        organizationId,
        validation.data,
      );
      return res.status(201).json({ success: true, data: domain });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(404)
          .json({ success: false, error: error.message, statusCode: 404 });
      }
      if (error instanceof ConflictException) {
        return res
          .status(409)
          .json({ success: false, error: error.message, statusCode: 409 });
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
    // Validate request body
    const validation = UpdateDomainSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const domain = await this.redirectService.updateDomain(
        id,
        organizationId,
        validation.data,
      );
      return res.json({ success: true, data: domain });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(404)
          .json({ success: false, error: error.message, statusCode: 404 });
      }
      if (error instanceof ConflictException) {
        return res
          .status(409)
          .json({ success: false, error: error.message, statusCode: 409 });
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
      await this.redirectService.deleteDomain(id, organizationId);
      return res.json({
        success: true,
        message: 'Domain deleted successfully',
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
