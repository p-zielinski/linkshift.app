import {
  Body,
  Controller,
  Get,
  Post,
  Param,
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
  ) {
  }

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
      plan: body.plan,
    });
    return this.billingService.createCheckout({
      organizationId,
      userId,
      plan: body.plan,
      interval: body.interval,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
  }

  @Get('portal')
  @UseGuards(AuthGuard)
  async getPortalUrl(@User('organizationId') organizationId: string) {
    this.logger.log('Billing portal requested', {
      requestId: this.clsService.getId(),
      organizationId,
    });
    const url = await this.billingService.getCustomerPortalUrl(organizationId);
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

  @Get('custom-plans')
  @UseGuards(AuthGuard)
  async getCustomPlans(@User('organizationId') organizationId: string) {
    return this.billingService.getCustomPlanCatalog(organizationId);
  }

  @Post('custom-plans/:id/checkout')
  @UseGuards(AuthGuard)
  async createCustomPlanCheckout(
    @User('organizationId') organizationId: string,
    @User('userId') userId: string,
    @Param('id') customPlanId: string,
    @Body(new ZodPipe(billingSchemas.CustomPlanCheckoutSchema))
    body: billingSchemas.CustomPlanCheckoutDto,
  ) {
    return this.billingService.createCustomPlanCheckout({
      organizationId,
      userId,
      customPlanId,
      interval: body.interval,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
  }

  @Get('plans')
  async getPlans() {
    return this.billingService.getPlanCatalog();
  }

  @Post('webhooks/lemon-squeezy')
  async lemonWebhook(@Req() request: Request, @Body() body: any) {
    this.logger.log('Billing webhook received', {
      eventName: body?.meta?.event_name ?? 'unknown',
    });
    const signature = request.header('x-signature') ?? undefined;
    const rawBody =
      (request as any).rawBody ?? Buffer.from(JSON.stringify(body));

    await this.billingService.handleWebhook(rawBody, signature, body);

    return { received: true };
  }
}
