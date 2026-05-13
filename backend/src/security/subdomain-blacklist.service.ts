import { Injectable } from '@nestjs/common';

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
  isReserved(name: string): boolean {
    const normalized = this.normalize(name);
    if (!normalized) {
      return false;
    }
    return RESERVED_SUBDOMAIN_NAMES.has(normalized);
  }

  private normalize(value: string): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }
}
