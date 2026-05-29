import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { DocsAssistantSearchStage } from './docs-assistant-search-stages';
import { TOOLS_API_CONFIG } from '../config/tools-api-config';
import { parseDocsAssistantStreamBuffer } from './docs-assistant-stream.util';

export type DocsSearchResult = {
  answer: string;
  sources: string[];
  logId: string | null;
  conversationSummary: string | null;
};

export type DocsRateResult = {
  success: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class DocsAssistantApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(TOOLS_API_CONFIG);
  private readonly searchUrl = `${this.apiConfig.baseUrl}/api/v1/public/docs/search`;
  private readonly rateUrl = `${this.apiConfig.baseUrl}/api/v1/public/docs/rate`;

  async searchStream(
    question: string,
    conversationSummary: string | null | undefined,
    turnstileToken: string | null | undefined,
    onStatus: (stage: DocsAssistantSearchStage) => void,
  ): Promise<DocsSearchResult> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    const token = turnstileToken?.trim();
    if (token) {
      headers.set('X-Turnstile-Token', token);
    }

    const summary = conversationSummary?.trim();
    const body: { question: string; conversationSummary?: string } = {
      question: question.trim(),
    };
    if (summary) {
      body.conversationSummary = summary;
    }

    const response = await fetch(this.searchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw await this.toHttpError(response);
    }

    if (!response.body) {
      throw new Error("Couldn't get an answer. Try again in a moment");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result: DocsSearchResult | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseDocsAssistantStreamBuffer(buffer);
      buffer = parsed.remainder;

      for (const event of parsed.events) {
        if (event.type === 'status') {
          onStatus(event.stage);
          continue;
        }

        if (event.type === 'error') {
          throw new Error(event.details);
        }

        result = {
          answer: event.answer,
          sources: event.sources,
          logId: event.logId,
          conversationSummary: event.conversationSummary,
        };
      }
    }

    if (buffer.trim()) {
      const parsed = parseDocsAssistantStreamBuffer(`${buffer}\n`);
      for (const event of parsed.events) {
        if (event.type === 'status') {
          onStatus(event.stage);
          continue;
        }

        if (event.type === 'error') {
          throw new Error(event.details);
        }

        result = {
          answer: event.answer,
          sources: event.sources,
          logId: event.logId,
          conversationSummary: event.conversationSummary,
        };
      }
    }

    if (!result) {
      throw new Error("Couldn't get an answer. Try again in a moment");
    }

    return result;
  }

  rateAnswer(logId: string, rating: 1 | -1 | 0): Observable<DocsRateResult> {
    return this.http.post<DocsRateResult>(this.rateUrl, { logId, rating });
  }

  private async toHttpError(response: Response): Promise<Error> {
    let details: string | null = null;

    try {
      const payload: unknown = await response.json();
      if (typeof payload === 'object' && payload !== null && 'details' in payload) {
        const value = (payload as { details?: unknown }).details;
        if (typeof value === 'string' && value.trim()) {
          details = value.trim();
        }
      }
    } catch {
      // Ignore parse failures and fall back to generic messaging.
    }

    if (response.status === 429) {
      return new Error(details ?? 'Too many questions. Wait a minute and try again');
    }

    if (response.status === 403) {
      return new Error(details ?? "Couldn't verify the request. Refresh the page and try again");
    }

    return new Error(details ?? "Couldn't get an answer. Try again in a moment");
  }
}
