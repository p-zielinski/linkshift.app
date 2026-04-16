import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { TOOLS_API_CONFIG } from '../config/tools-api-config';

export type QrCodeAssetFormat = 'png' | 'svg' | 'eps';

@Injectable({
  providedIn: 'root',
})
export class QrCodeApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(TOOLS_API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/public/qr-code`;

  generate(url: string, format: QrCodeAssetFormat, size = 512): Observable<Blob> {
    const params = new HttpParams().set('url', url).set('format', format).set('size', String(size));

    return this.http.get(this.apiUrl, {
      params,
      responseType: 'blob',
    });
  }
}
