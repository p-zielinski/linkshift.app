import { HttpParams } from '@angular/common/http';
import type { QueryParams } from '../models/query-params.model';

export function buildHttpParams(params?: QueryParams): HttpParams {
  let httpParams = new HttpParams();

  if (!params) {
    return httpParams;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === null || item === undefined) {
          return;
        }
        httpParams = httpParams.append(key, String(item));
      });
      return;
    }
    httpParams = httpParams.append(key, String(value));
  });

  return httpParams;
}
