import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { BillingService } from '../billing/billing.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import * as billingSchemas from '../zod-schames/billing.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { Logger } from 'nestjs-pino';
import { ClsService } from 'nestjs-cls';

@Controller('api/v1/billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckout(
    @User('organizationId') organizationId: string,
    @User('userId') userId: string,
    @Body(new ZodPipe(billingSchemas.CreateCheckoutSchema))
    body: billingSchemas.CreateCheckoutDto,
  ) {
    this.logger.log('Billing checkout requested', {
      requestId: this.clsService.getId(),
      organizationId,
      userId,
      priceId: body.priceId,
    });
    return this.billingService.createCheckoutByPrice({
      organizationId,
      userId,
      priceId: body.priceId,
      successUrl: body.successUrl,
    });
  }

  @Post('checkout-sessions')
  @UseGuards(AuthGuard)
  async createCheckoutSession(
    @User('organizationId') organizationId: string,
    @User('userId') userId: string,
    @Body(new ZodPipe(billingSchemas.CreateCheckoutSessionSchema))
    body: billingSchemas.CreateCheckoutSessionDto,
  ) {
    this.logger.log('Billing checkout session requested', {
      requestId: this.clsService.getId(),
      organizationId,
      userId,
      priceId: body.priceId,
    });
    return this.billingService.createCheckoutSession({
      organizationId,
      userId,
      priceId: body.priceId,
    });
  }

  @Get('portal')
  @UseGuards(AuthGuard)
  async getPortalUrl(
    @User('organizationId') organizationId: string,
    @Query('action') action?: string,
  ) {
    const parsedPortalAction = billingSchemas.PortalActionSchema.safeParse(
      action ?? 'manage',
    );
    const portalAction = parsedPortalAction.success
      ? parsedPortalAction.data
      : 'manage';
    this.logger.log('Billing portal requested', {
      requestId: this.clsService.getId(),
      organizationId,
      action: portalAction,
    });
    const url = await this.billingService.getCustomerPortalUrl(
      organizationId,
      portalAction,
    );
    return { url };
  }

  @Get('checkout-sessions/:id')
  @UseGuards(AuthGuard)
  async getCheckoutSession(
    @User('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    this.logger.log('Billing checkout session requested', {
      requestId: this.clsService.getId(),
      organizationId,
      checkoutSessionId: id,
    });
    return this.billingService.getCheckoutSessionStatus(organizationId, id);
  }

  @Get('plans')
  async getPlans() {
    return this.billingService.getPlanCatalog();
  }

  @Post('webhooks/paddle')
  async paddleWebhook(@Req() request: Request, @Body() body: any) {
    this.logger.log('Billing webhook received', {
      eventName: body?.event_type ?? 'unknown',
    });
    const signature = request.header('paddle-signature') ?? undefined;
    const rawBody =
      (request as any).rawBody ?? Buffer.from(JSON.stringify(body));

    await this.billingService.handleWebhook(rawBody, signature, body);

    return { received: true };
  }
}
