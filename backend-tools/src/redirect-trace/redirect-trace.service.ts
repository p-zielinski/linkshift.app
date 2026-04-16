import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { BadRequestError } from '@shared/models/error.model';
import { throwHttpException, createRequestId } from '../utils';

const REQUEST_TIMEOUT_MS = 3000;
const DNS_TIMEOUT_MS = 1000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export type RedirectTraceStep = {
  url: string;
  status: number | null;
  latencyMs: number;
  server: string | null;
  destination: string | null;
  isRedirect: boolean;
  headers: Record<string, string>;
  error?: string;
};

@Injectable()
export class RedirectTraceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  async traceStep(rawUrl: string, userAgent: string): Promise<RedirectTraceStep> {
    const currentUrl = this.normalizeIncomingUrl(rawUrl);
    await this.assertUrlAllowed(currentUrl);

    const startedAt = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.get(currentUrl, {
          timeout: REQUEST_TIMEOUT_MS,
          maxRedirects: 0,
          validateStatus: () => true,
          headers: {
            'User-Agent': userAgent,
            Accept: '*/*',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }),
      );

      const latencyMs = Date.now() - startedAt;
      const headers = this.normalizeHeaders(response.headers as Record<string, unknown>);
      const status = response.status;
      const locationHeader = headers['location'] ?? null;
      const destination = locationHeader
        ? this.resolveDestination(currentUrl, locationHeader)
        : null;
      const isRedirect = REDIRECT_STATUSES.has(status) && !!destination;

      return {
        url: currentUrl,
        status,
        latencyMs,
        server: headers['server'] ?? null,
        destination,
        isRedirect,
        headers,
      };
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      const message = this.resolveRequestError(error);

      this.logger.warn('Redirect trace request failed', {
        requestId: this.clsService.getId(),
        url: currentUrl,
        message,
      });

      return {
        url: currentUrl,
        status: null,
        latencyMs,
        server: null,
        destination: null,
        isRedirect: false,
        headers: {},
        error: message,
      };
    }
  }

  private normalizeIncomingUrl(value: string): string {
    const trimmed = value.trim();
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    return new URL(candidate).toString();
  }

  private resolveDestination(currentUrl: string, locationHeader: string): string | null {
    try {
      return new URL(locationHeader, currentUrl).toString();
    } catch {
      return null;
    }
  }

  private normalizeHeaders(headers: Record<string, unknown>): Record<string, string> {
    const normalized: Record<string, string> = {};

    for (const [rawKey, rawValue] of Object.entries(headers)) {
      const key = rawKey.trim().toLowerCase();
      if (!key || key === 'set-cookie') {
        continue;
      }

      if (Array.isArray(rawValue)) {
        normalized[key] = rawValue.map((item) => String(item)).join(', ');
        continue;
      }

      if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
        normalized[key] = String(rawValue);
      }
    }

    return normalized;
  }

  private resolveRequestError(error: unknown): string {
    if (typeof error !== 'object' || error === null) {
      return 'Request failed';
    }

    const maybeCode = 'code' in error ? (error as { code?: unknown }).code : undefined;
    const code = typeof maybeCode === 'string' ? maybeCode : null;

    if (code === 'ECONNABORTED') {
      return `Request timeout after ${REQUEST_TIMEOUT_MS} ms`;
    }
    if (code === 'ENOTFOUND') {
      return 'DNS lookup failed for target host';
    }
    if (code === 'ECONNREFUSED') {
      return 'Connection refused by target host';
    }

    const maybeMessage = 'message' in error ? (error as { message?: unknown }).message : undefined;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    return 'Request failed';
  }

  private async assertUrlAllowed(rawUrl: string): Promise<void> {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      this.throwBadRequest('Only HTTP and HTTPS protocols are supported.');
    }

    const hostname = parsed.hostname.trim().toLowerCase();
    if (!hostname) {
      this.throwBadRequest('Target URL hostname is missing.');
    }

    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      this.throwBadRequest('Localhost targets are not allowed.');
    }

    const normalizedHost = this.normalizeIpCandidate(hostname);
    if (isIP(normalizedHost)) {
      if (this.isBlockedIp(normalizedHost)) {
        this.throwBadRequest('Private and local IP ranges are blocked by SSRF protection.');
      }
      return;
    }

    const records = await this.resolveWithTimeout(hostname);
    if (!records.length) {
      this.throwBadRequest('DNS resolution returned no addresses for the target host.');
    }

    for (const record of records) {
      const normalizedAddress = this.normalizeIpCandidate(record.address);
      if (this.isBlockedIp(normalizedAddress)) {
        this.throwBadRequest('Target host resolves to a private or local network address.');
      }
    }
  }

  private async resolveWithTimeout(hostname: string) {
    const dnsPromise = lookup(hostname, {
      all: true,
      verbatim: true,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('DNS lookup timeout'));
      }, DNS_TIMEOUT_MS);
    });

    try {
      return await Promise.race([dnsPromise, timeoutPromise]);
    } catch {
      this.throwBadRequest('DNS lookup failed for target host.');
    }
  }

  private normalizeIpCandidate(candidate: string): string {
    const withoutBrackets = candidate.replace(/^\[/, '').replace(/\]$/, '');
    const [withoutZone] = withoutBrackets.split('%');
    const lower = withoutZone.toLowerCase();

    if (lower.startsWith('::ffff:')) {
      const mapped = lower.slice('::ffff:'.length);
      if (isIP(mapped) === 4) {
        return mapped;
      }
    }

    return lower;
  }

  private isBlockedIp(address: string): boolean {
    const version = isIP(address);

    if (version === 4) {
      const [first = 0, second = 0] = address.split('.').map((chunk) => Number(chunk));

      if (first === 10) {
        return true;
      }
      if (first === 127) {
        return true;
      }
      if (first === 192 && second === 168) {
        return true;
      }
      if (first === 172) {
        return true;
      }
      if (first === 169 && second === 254) {
        return true;
      }
      if (first === 0) {
        return true;
      }

      return false;
    }

    if (version === 6) {
      if (address === '::1' || address === '::') {
        return true;
      }
      if (address.startsWith('fc') || address.startsWith('fd')) {
        return true;
      }
      if (address.startsWith('fe80:')) {
        return true;
      }
    }

    return false;
  }

  private throwBadRequest(details: string): never {
    return throwHttpException(
      new BadRequestError({
        requestId: this.clsService.getId() ?? createRequestId(),
        details,
      }),
    );
  }
}
