import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

type ZeptoMailSender = {
  address: string;
  name?: string;
};

type ZeptoMailRecipient = {
  email_address: {
    address: string;
    name?: string;
  };
};

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  async sendVerificationEmail(params: {
    email: string;
    token: string;
  }): Promise<void> {
    const appUrl = this.getAppUrl();
    const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(
      params.token,
    )}`;
    const subject = 'Verify your email';
    const text = [
      'Confirm your email address to finish setup.',
      `Verification link: ${verifyUrl}`,
      'This link expires in 30 minutes.',
    ].join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendPasswordResetEmail(params: {
    email: string;
    token: string;
  }): Promise<void> {
    const appUrl = this.getAppUrl();
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(
      params.token,
    )}`;
    const subject = 'Reset your password';
    const text = [
      'We received a password reset request for your account.',
      `Reset link: ${resetUrl}`,
      'This link expires in 30 minutes.',
    ].join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendEmailChangeCode(params: {
    email: string;
    code: string;
  }): Promise<void> {
    const subject = 'Confirm your new email';
    const text = [
      'Use the verification code below to confirm your new email address.',
      `Code: ${params.code}`,
      'This code expires in 30 minutes.',
    ].join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendOrganizationInvite(params: {
    email: string;
    inviter: string;
    organization: string;
    token: string;
  }): Promise<void> {
    const appUrl = this.getAppUrl();
    const inviteUrl = `${appUrl}/invite?token=${encodeURIComponent(
      params.token,
    )}`;
    const subject = `Invitation to join ${params.organization}`;
    const text = [
      `${params.inviter} invited you to join ${params.organization}.`,
      `Accept invite: ${inviteUrl}`,
      'This link expires in 30 minutes.',
    ].join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendSubscriptionActivated(params: {
    email: string;
    organization: string;
    plan: string;
    amount?: number;
    currency?: string;
    interval?: string;
  }): Promise<void> {
    const subject = `Subscription active for ${params.organization}`;
    const text = [
      `Your ${params.plan} plan is now active for ${params.organization}.`,
      params.amount
        ? `Amount: ${params.amount} ${params.currency ?? ''} (${params.interval ?? 'monthly'}).`
        : null,
      'Thank you for upgrading your subscription.',
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendSubscriptionRenewal(params: {
    email: string;
    organization: string;
    plan: string;
    amount?: number;
    currency?: string;
    interval?: string;
    renewsAt?: Date | null;
  }): Promise<void> {
    const subject = `Subscription renewed for ${params.organization}`;
    const text = [
      `Your ${params.plan} subscription has been renewed.`,
      params.amount
        ? `Amount: ${params.amount} ${params.currency ?? ''} (${params.interval ?? 'monthly'}).`
        : null,
      params.renewsAt
        ? `Next renewal: ${this.formatDate(params.renewsAt)}.`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendSubscriptionCanceled(params: {
    email: string;
    organization: string;
    plan: string;
    endsAt?: Date | null;
  }): Promise<void> {
    const subject = `Subscription canceled for ${params.organization}`;
    const text = [
      `Your ${params.plan} subscription has been canceled.`,
      params.endsAt
        ? `Access continues until ${this.formatDate(params.endsAt)}.`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendSubscriptionPaymentFailed(params: {
    email: string;
    organization: string;
    plan: string;
  }): Promise<void> {
    const subject = `Payment failed for ${params.organization}`;
    const text = [
      `We could not process the latest payment for your ${params.plan} subscription.`,
      'Please update your payment method to avoid service interruption.',
    ].join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendRedirectRuleBlockedAlert(params: {
    email: string;
    organization: string;
    ruleId: string;
    destination: string;
    unsafeDomains: string[];
    detectedAt?: Date;
  }): Promise<void> {
    const appUrl = this.getAppUrl();
    const reviewUrl = `${appUrl}/redirect-rules`;
    const timestamp = params.detectedAt
      ? this.formatDateTime(params.detectedAt)
      : this.formatDateTime(new Date());
    const subject = `Redirect rule blocked for ${params.organization}`;
    const text = [
      `We blocked a redirect rule in ${params.organization} after a safety rescan.`,
      `Rule ID: ${params.ruleId}`,
      `Destination: ${params.destination}`,
      `Unsafe domains: ${params.unsafeDomains.join(', ')}`,
      `Detected at: ${timestamp}`,
      `Review rules: ${reviewUrl}`,
      'If this is unexpected, update or remove the rule and verify destination safety.',
    ].join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  async sendPlanChanged(params: {
    email: string;
    organization: string;
    fromPlan: string;
    toPlan: string;
  }): Promise<void> {
    const subject = `Plan updated for ${params.organization}`;
    const text = [
      `Your plan has changed from ${params.fromPlan} to ${params.toPlan}.`,
      'The new limits apply immediately unless otherwise specified.',
    ].join('\n');

    await this.sendMail({
      to: params.email,
      subject,
      text,
      html: this.wrapHtml(text),
    });
  }

  private async sendMail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    const authorizationToken =
      this.configService.get<string>('ZEPTOMAIL_API_KEY') ?? '';
    const apiUrl =
      this.configService.get<string>('ZEPTOMAIL_API_URL') ??
      'https://api.zeptomail.com/v1.1/email';
    const sender = this.resolveSender();

    if (!authorizationToken || !sender) {
      this.logger.warn('Email skipped due to missing ZeptoMail config', {
        to: params.to,
        sender: !!sender,
        authorizationToken: !!authorizationToken,
      });
      return;
    }

    const payload = {
      from: {
        address: sender.address,
        ...(sender.name ? { name: sender.name } : {}),
      },
      to: [this.buildRecipient(params.to)],
      subject: params.subject,
      htmlbody: params.html ?? this.wrapHtml(params.text),
      textbody: params.text,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-enczapikey ${authorizationToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.warn('ZeptoMail send failed', {
        status: response.status,
        body,
      });
      throw new Error('Email delivery failed.');
    }
  }

  private resolveSender(): ZeptoMailSender | null {
    const address =
      this.configService.get<string>('ZEPTOMAIL_FROM_ADDRESS') ?? '';
    const name = this.configService.get<string>('ZEPTOMAIL_FROM_NAME') ?? '';

    if (address) {
      return { address, ...(name ? { name } : {}) };
    }

    const legacy = this.configService.get<string>('EMAIL_FROM') ?? '';
    return this.parseSender(legacy);
  }

  private parseSender(raw: string): ZeptoMailSender | null {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(/^(?:"?(.+?)"?\s*)?<([^>]+)>$/);
    if (match) {
      const name = match[1]?.trim();
      const address = match[2]?.trim();
      if (address) {
        return { address, ...(name ? { name } : {}) };
      }
    }

    if (trimmed.includes('@')) {
      return { address: trimmed };
    }

    return null;
  }

  private buildRecipient(email: string): ZeptoMailRecipient {
    return {
      email_address: { address: email },
    };
  }

  private getAppUrl(): string {
    return (
      this.configService.get<string>('APP_WEB_URL') ?? 'http://localhost:4200'
    );
  }

  private wrapHtml(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
    return `<div style="font-family:Arial, sans-serif; font-size:14px; line-height:1.5">${escaped}</div>`;
  }

  private formatDate(value: Date): string {
    return value.toISOString().split('T')[0];
  }

  private formatDateTime(value: Date): string {
    return value.toISOString().replace('T', ' ').split('.')[0] + ' UTC';
  }
}
