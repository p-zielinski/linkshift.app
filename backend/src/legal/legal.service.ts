import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LegalService {
  constructor(private readonly configService: ConfigService) {}

  getLegalVersion(): string {
    return this.configService.get<string>('LEGAL_VERSION') ?? 'v1';
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
    if (!user.termsAcceptedAt || !user.privacyAcceptedAt || !user.ageConfirmedAt) {
      return false;
    }
    const version = this.getLegalVersion();
    if (!user.legalVersion) {
      return false;
    }
    return user.legalVersion === version;
  }
}
