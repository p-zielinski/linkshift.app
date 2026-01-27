import { HttpParams, type HttpParameterCodec } from '@angular/common/http';
import type { QueryParams } from '../models/query-params.model';

class StrictHttpUrlEncodingCodec implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

export function buildHttpParams(params?: QueryParams): HttpParams {
  let httpParams = new HttpParams({ encoder: new StrictHttpUrlEncodingCodec() });

  if (!params) {
    return httpParams;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    httpParams = httpParams.append(key, String(value));
  });

  return httpParams;
}
