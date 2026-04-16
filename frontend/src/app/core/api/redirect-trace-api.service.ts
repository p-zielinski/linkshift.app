import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, type Observable } from 'rxjs';
import { TOOLS_API_CONFIG } from '../config/tools-api-config';

export const DEFAULT_TRACE_MAX_HOPS = 20;

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

export type RedirectTraceHop = RedirectTraceStep & {
  hop: number;
};

export type RedirectTraceChainResult = {
  hops: RedirectTraceHop[];
  finalUrl: string | null;
  loopDetected: boolean;
  loopUrl: string | null;
  stoppedByMaxHops: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class RedirectTraceApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(TOOLS_API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/public/trace`;

  traceStep(url: string, userAgent?: string): Observable<RedirectTraceStep> {
    let params = new HttpParams().set('url', url);

    if (userAgent && userAgent.trim()) {
      params = params.set('userAgent', userAgent.trim());
    }

    return this.http.get<RedirectTraceStep>(this.apiUrl, {
      params,
    });
  }

  async traceChain(
    startUrl: string,
    userAgent?: string,
    maxHops = DEFAULT_TRACE_MAX_HOPS,
  ): Promise<RedirectTraceChainResult> {
    const hops: RedirectTraceHop[] = [];
    const visitedUrls = new Set<string>();
    let currentUrl = this.normalizeUrl(startUrl);
    let loopDetected = false;
    let loopUrl: string | null = null;

    for (let index = 0; index < maxHops; index += 1) {
      if (visitedUrls.has(currentUrl)) {
        loopDetected = true;
        loopUrl = currentUrl;
        break;
      }

      visitedUrls.add(currentUrl);
      const step = await firstValueFrom(this.traceStep(currentUrl, userAgent));
      const hop: RedirectTraceHop = {
        ...step,
        hop: index + 1,
      };

      hops.push(hop);

      if (step.error || !step.isRedirect || !step.destination) {
        break;
      }

      currentUrl = step.destination;
    }

    const lastHop = hops[hops.length - 1] ?? null;
    const stoppedByMaxHops =
      !loopDetected &&
      hops.length === maxHops &&
      !!lastHop &&
      !lastHop.error &&
      lastHop.isRedirect &&
      !!lastHop.destination;

    return {
      hops,
      finalUrl: this.resolveFinalUrl(hops, loopDetected || stoppedByMaxHops),
      loopDetected,
      loopUrl,
      stoppedByMaxHops,
    };
  }

  private normalizeUrl(value: string): string {
    const trimmed = value.trim();
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    return new URL(candidate).toString();
  }

  private resolveFinalUrl(hops: RedirectTraceHop[], unresolved: boolean): string | null {
    if (!hops.length || unresolved) {
      return null;
    }

    const last = hops[hops.length - 1];
    if (!last || last.error) {
      return null;
    }

    if (!last.isRedirect && last.status !== null) {
      return last.url;
    }

    return last.destination ?? null;
  }
}
