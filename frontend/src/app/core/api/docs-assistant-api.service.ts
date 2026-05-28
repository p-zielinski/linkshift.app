import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { TOOLS_API_CONFIG } from '../config/tools-api-config';

export type DocsSearchResult = {
  answer: string;
  sources: string[];
  logId: string | null;
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

  search(question: string, turnstileToken?: string | null): Observable<DocsSearchResult> {
    let headers = new HttpHeaders();
    const token = turnstileToken?.trim();
    if (token) {
      headers = headers.set('X-Turnstile-Token', token);
    }

    return this.http.post<DocsSearchResult>(
      this.searchUrl,
      { question: question.trim() },
      { headers },
    );
  }

  rateAnswer(logId: string, rating: 1 | -1 | 0): Observable<DocsRateResult> {
    return this.http.post<DocsRateResult>(this.rateUrl, { logId, rating });
  }
}
