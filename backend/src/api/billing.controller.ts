import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { BillingService } from '../billing/billing.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import * as billingSchemas from '../zod-schames/billing.schemas';
import { ZodPipe } from '../pipes/zod.pipe';

@Controller('api/v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckout(
    @User('organizationId') organizationId: string,
    @User('userId') userId: string,
    @Body(new ZodPipe(billingSchemas.CreateCheckoutSchema))
    body: billingSchemas.CreateCheckoutDto,
  ) {
    return this.billingService.createCheckout({
      organizationId,
      userId,
      plan: body.plan,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
  }

  @Get('portal')
  @UseGuards(AuthGuard)
  async getPortalUrl(@User('organizationId') organizationId: string) {
    const url = await this.billingService.getCustomerPortalUrl(organizationId);
    return { url };
  }

  @Post('webhooks/lemon-squeezy')
  async lemonWebhook(@Req() request: Request, @Body() body: any) {
    const signature = request.header('x-signature') ?? undefined;
    const rawBody =
      (request as any).rawBody ?? Buffer.from(JSON.stringify(body));

    await this.billingService.handleWebhook(rawBody, signature, body);

    return { received: true };
  }
}
