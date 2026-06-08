import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import type { AuthTokens } from '../models/auth.model';
import { AuthStore } from '../store/auth.store';
import { authInterceptor, resetAuthInterceptorStateForTests } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let accessToken: string | null = null;
  let refreshResult: AuthTokens | 'error' = { accessToken: 'new-token' };
  const refreshTokens = vi.fn();
  const logout = vi.fn((redirect: () => void) => redirect());
  const navigateByUrl = vi.fn(() => Promise.resolve(true));

  beforeEach(() => {
    resetAuthInterceptorStateForTests();
    accessToken = null;
    refreshResult = { accessToken: 'new-token' };
    refreshTokens.mockReset();
    refreshTokens.mockImplementation(() =>
      refreshResult === 'error'
        ? throwError(() => new Error('refresh failed'))
        : of(refreshResult),
    );
    logout.mockReset();
    logout.mockImplementation((redirect: () => void) => redirect());
    navigateByUrl.mockReset();
    navigateByUrl.mockImplementation(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            accessToken: () => accessToken,
            refreshTokens,
            logout,
          },
        },
        {
          provide: Router,
          useValue: { navigateByUrl },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches Bearer token when accessToken is set', () => {
    accessToken = 'test-token';

    http.get('/api/v1/links').subscribe();

    const req = httpMock.expectOne('/api/v1/links');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([]);
  });

  it('skips auth header for public paths like /api/v1/auth/login', () => {
    accessToken = 'test-token';

    http.post('/api/v1/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('retries the original request with a new token after 401 and refresh success', () => {
    accessToken = 'old-token';

    http.get('/api/v1/links').subscribe();

    const initialReq = httpMock.expectOne('/api/v1/links');
    expect(initialReq.request.headers.get('Authorization')).toBe('Bearer old-token');
    initialReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(refreshTokens).toHaveBeenCalledTimes(1);

    const retryReq = httpMock.expectOne('/api/v1/links');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retryReq.flush([]);
  });

  it('logs out and navigates to /auth once when refresh fails for concurrent 401s', () => {
    accessToken = 'old-token';
    const refreshFailure = new Subject<never>();
    refreshTokens.mockReturnValue(refreshFailure.asObservable());

    http.get('/api/v1/links').subscribe({ error: () => {} });
    http.get('/api/v1/domains').subscribe({ error: () => {} });

    const firstReq = httpMock.expectOne('/api/v1/links');
    const secondReq = httpMock.expectOne('/api/v1/domains');
    firstReq.flush(null, { status: 401, statusText: 'Unauthorized' });
    secondReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(refreshTokens).toHaveBeenCalledTimes(1);

    refreshFailure.error(new Error('refresh failed'));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(navigateByUrl).toHaveBeenCalledTimes(1);
    expect(navigateByUrl).toHaveBeenCalledWith('/auth');
  });

  it('logs out without calling refresh again when retry after refresh returns 401', () => {
    accessToken = 'old-token';

    http.get('/api/v1/links').subscribe({ error: () => {} });

    const initialReq = httpMock.expectOne('/api/v1/links');
    initialReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(refreshTokens).toHaveBeenCalledTimes(1);

    const retryReq = httpMock.expectOne('/api/v1/links');
    retryReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(navigateByUrl).toHaveBeenCalledWith('/auth');
  });
});
