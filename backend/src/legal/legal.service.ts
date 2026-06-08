import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

@Injectable()
export class LegalService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  getLegalVersion(): string {
    return this.configService.get<string>('LEGAL_VERSION') ?? 'v3';
  }

  buildConsentRecord(): {
    termsAcceptedAt: Date;
    privacyAcceptedAt: Date;
    ageConfirmedAt: Date;
    legalVersion: string;
  } {
    const now = new Date();
    return {
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
      ageConfirmedAt: now,
      legalVersion: this.getLegalVersion(),
    };
  }

  isConsentUpToDate(user: {
    termsAcceptedAt?: Date | string | null;
    privacyAcceptedAt?: Date | string | null;
    ageConfirmedAt?: Date | string | null;
    legalVersion?: string | null;
  }): boolean {
    if (
      !user.termsAcceptedAt ||
      !user.privacyAcceptedAt ||
      !user.ageConfirmedAt
    ) {
      return false;
    }
    const version = this.getLegalVersion();
    if (!user.legalVersion) {
      return false;
    }
    return user.legalVersion === version;
  }
}
