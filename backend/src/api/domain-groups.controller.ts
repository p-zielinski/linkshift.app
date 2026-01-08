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
} from '@nestjs/common';
import express from 'express';
import { ConfigService } from '@nestjs/config';
import { RedirectService } from '../redirect.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import {
  CreateDomainGroupSchema,
  UpdateDomainGroupSchema,
} from '../zod-schames/domain-group.schemas';

@Controller('api/v1/domain-groups')
export class DomainGroupsController {
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
    const domainGroups =
      await this.redirectService.listDomainGroups(organizationId);

    return res.json({
      success: true,
      data: domainGroups,
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
      const domainGroup = await this.redirectService.getDomainGroupById(
        id,
        organizationId,
      );
      return res.json({ success: true, data: domainGroup });
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
    const validation = CreateDomainGroupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    const domainGroup = await this.redirectService.createDomainGroup(
      organizationId,
      validation.data,
    );

    return res.status(201).json({
      success: true,
      data: domainGroup,
    });
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
    const validation = UpdateDomainGroupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
        statusCode: 400,
      });
    }

    try {
      const domainGroup = await this.redirectService.updateDomainGroup(
        id,
        organizationId,
        validation.data,
      );
      return res.json({ success: true, data: domainGroup });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(404)
          .json({ success: false, error: error.message, statusCode: 404 });
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
      await this.redirectService.deleteDomainGroup(id, organizationId);
      return res.json({
        success: true,
        message: 'Domain group deleted successfully',
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
