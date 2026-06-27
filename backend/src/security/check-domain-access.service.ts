import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isIPv4, isIPv6 } from 'net';
import type { Request } from 'express';
import { Logger } from 'nestjs-pino';

const ENV_ALLOWED_IPS_KEY = 'CADDY_CHECK_DOMAIN_ALLOWED_IPS';

export const DEFAULT_CHECK_DOMAIN_ALLOWED_CIDRS = [
  '127.0.0.0/8',
  '::1/128',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '169.254.0.0/16',
] as const;

type ParsedCidr = {
  version: 4 | 6;
  network: bigint;
  prefixLength: number;
};

@Injectable()
export class CheckDomainAccessService implements OnModuleInit {
  private extraAllowedCidrs: ParsedCidr[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  onModuleInit(): void {
    this.extraAllowedCidrs = this.parseExtraAllowedCidrs();
  }

  isAllowedRequest(req: Pick<Request, 'ip'>): boolean {
    return this.isAllowed(req.ip);
  }

  isAllowed(clientIp: string | undefined): boolean {
    const normalized = this.normalizeClientIp(clientIp);
    if (!normalized) {
      return false;
    }

    return (
      this.matchesAnyCidr(normalized, DEFAULT_CHECK_DOMAIN_ALLOWED_CIDRS) ||
      this.matchesParsedCidrs(normalized, this.extraAllowedCidrs)
    );
  }

  normalizeClientIp(ip: string | undefined): string | null {
    const trimmed = String(ip ?? '').trim();
    if (!trimmed) {
      return null;
    }

    const lower = trimmed.toLowerCase();
    const mappedIpv4 = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mappedIpv4) {
      return mappedIpv4[1];
    }

    if (isIPv4(lower) || isIPv6(lower)) {
      return lower;
    }

    return null;
  }

  private parseExtraAllowedCidrs(): ParsedCidr[] {
    const raw = String(
      this.configService.get<string>(ENV_ALLOWED_IPS_KEY) ?? '',
    ).trim();
    if (!raw) {
      return [];
    }

    const parsed: ParsedCidr[] = [];
    for (const entry of raw.split(',')) {
      const candidate = entry.trim();
      if (!candidate) {
        continue;
      }

      const parsedCidr = this.parseCidr(candidate);
      if (parsedCidr) {
        parsed.push(parsedCidr);
        continue;
      }

      this.logger.warn('Ignoring invalid CADDY_CHECK_DOMAIN_ALLOWED_IPS entry', {
        entry: candidate,
      });
    }

    return parsed;
  }

  private matchesAnyCidr(
    ip: string,
    cidrs: readonly string[],
  ): boolean {
    return cidrs.some((cidr) => this.matchesCidr(ip, cidr));
  }

  private matchesParsedCidrs(ip: string, cidrs: ParsedCidr[]): boolean {
    const address = this.parseIpToBigInt(ip);
    if (!address) {
      return false;
    }

    return cidrs.some((cidr) =>
      this.matchesParsedCidr(address.version, address.value, cidr),
    );
  }

  private matchesCidr(ip: string, cidr: string): boolean {
    const parsedCidr = this.parseCidr(cidr);
    if (!parsedCidr) {
      return false;
    }

    const address = this.parseIpToBigInt(ip);
    if (!address) {
      return false;
    }

    return this.matchesParsedCidr(address.version, address.value, parsedCidr);
  }

  private matchesParsedCidr(
    version: 4 | 6,
    value: bigint,
    cidr: ParsedCidr,
  ): boolean {
    if (version !== cidr.version) {
      return false;
    }

    const mask =
      cidr.prefixLength === 0
        ? 0n
        : ((1n << BigInt(cidr.version === 4 ? 32 : 128)) - 1n) <<
          BigInt((cidr.version === 4 ? 32 : 128) - cidr.prefixLength);

    return (value & mask) === (cidr.network & mask);
  }

  private parseCidr(value: string): ParsedCidr | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const [addressPart, prefixPart] = trimmed.split('/');
    const address = this.normalizeClientIp(addressPart);
    if (!address) {
      return null;
    }

    const parsedAddress = this.parseIpToBigInt(address);
    if (!parsedAddress) {
      return null;
    }

    const defaultPrefix = parsedAddress.version === 4 ? 32 : 128;
    const prefixLength =
      prefixPart === undefined
        ? defaultPrefix
        : Number.parseInt(prefixPart, 10);
    const maxPrefix = parsedAddress.version === 4 ? 32 : 128;

    if (
      !Number.isInteger(prefixLength) ||
      prefixLength < 0 ||
      prefixLength > maxPrefix
    ) {
      return null;
    }

    return {
      version: parsedAddress.version,
      network: parsedAddress.value,
      prefixLength,
    };
  }

  private parseIpToBigInt(
    ip: string,
  ): { version: 4 | 6; value: bigint } | null {
    if (isIPv4(ip)) {
      const octets = ip.split('.').map((part) => Number.parseInt(part, 10));
      if (octets.some((octet) => octet < 0 || octet > 255)) {
        return null;
      }

      const value =
        (BigInt(octets[0]) << 24n) |
        (BigInt(octets[1]) << 16n) |
        (BigInt(octets[2]) << 8n) |
        BigInt(octets[3]);

      return { version: 4, value };
    }

    if (isIPv6(ip)) {
      const value = this.parseIpv6ToBigInt(ip);
      return value === null ? null : { version: 6, value };
    }

    return null;
  }

  private parseIpv6ToBigInt(ip: string): bigint | null {
    const expanded = this.expandIpv6(ip);
    if (!expanded) {
      return null;
    }

    let value = 0n;
    for (const part of expanded) {
      const segment = Number.parseInt(part, 16);
      if (!Number.isInteger(segment) || segment < 0 || segment > 0xffff) {
        return null;
      }
      value = (value << 16n) + BigInt(segment);
    }

    return value;
  }

  private expandIpv6(ip: string): string[] | null {
    const lower = ip.toLowerCase();
    if (!lower.includes('::')) {
      const parts = lower.split(':');
      if (parts.length !== 8) {
        return null;
      }
      return parts;
    }

    const [head, tail] = lower.split('::');
    const headParts = head ? head.split(':') : [];
    const tailParts = tail ? tail.split(':') : [];
    const missing = 8 - headParts.length - tailParts.length;

    if (missing < 0) {
      return null;
    }

    return [...headParts, ...Array.from({ length: missing }, () => '0'), ...tailParts];
  }
}
