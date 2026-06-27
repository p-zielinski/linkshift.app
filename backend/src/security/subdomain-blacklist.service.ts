import { Injectable } from '@nestjs/common';
import { LINKSHIFT_SUBDOMAIN_NAME_PATTERN } from './subdomain-name.constants';

const RESERVED_SUBDOMAIN_NAMES = new Set([
  'admin',
  'api',
  'dashboard',
  'docs',
  'dozzle',
  'dozzle-tools',
  'ftp',
  'grafana',
  'mail',
  'monitoring',
  'support',
  'tools',
  'www',
]);

@Injectable()
export class SubdomainBlacklistService {
  isValidName(name: string): boolean {
    const normalized = this.normalize(name);
    if (!normalized) {
      return false;
    }
    return LINKSHIFT_SUBDOMAIN_NAME_PATTERN.test(normalized);
  }

  isReserved(name: string): boolean {
    const normalized = this.normalize(name);
    if (!normalized) {
      return false;
    }
    return RESERVED_SUBDOMAIN_NAMES.has(normalized);
  }

  /** Names that can exist in LinkShiftSubdomain registry (format + not reserved). */
  canExistInRegistry(name: string): boolean {
    const normalized = this.normalize(name);
    if (!normalized || !LINKSHIFT_SUBDOMAIN_NAME_PATTERN.test(normalized)) {
      return false;
    }
    return !RESERVED_SUBDOMAIN_NAMES.has(normalized);
  }

  private normalize(value: string): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }
}
