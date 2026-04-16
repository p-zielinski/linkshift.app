import { HttpInterceptorFn } from '@angular/common/http';

export const noCacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next(req);
  }

  const headers = req.headers
    .set('Cache-Control', 'no-cache')
    .set('Pragma', 'no-cache');

  return next(req.clone({ headers }));
};
