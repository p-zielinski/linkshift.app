import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG } from '../config/api-config';
import { LinksListApiService } from './links-list-api.service';

describe('LinksListApiService', () => {
  let service: LinksListApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LinksListApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'https://api.test' } },
      ],
    });
    service = TestBed.inject(LinksListApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list requests /api/v1/links with query params', () => {
    service
      .list({
        domainGroupId: 'group-1',
        linkMapId: 'map-1',
        search: 'summer',
        limit: 25,
        startAfterId: 'entry-9',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === 'https://api.test/api/v1/links');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('domainGroupId')).toBe('group-1');
    expect(req.request.params.get('linkMapId')).toBe('map-1');
    expect(req.request.params.get('search')).toBe('summer');
    expect(req.request.params.get('limit')).toBe('25');
    expect(req.request.params.get('startAfterId')).toBe('entry-9');
    req.flush({ data: [], hasMore: false });
  });

  it('list throws when query is missing', () => {
    let error: Error | undefined;
    service.list().subscribe({ error: (err) => (error = err) });
    expect(error?.message).toBe('Missing links list query');
    httpMock.expectNone('https://api.test/api/v1/links');
  });

  it('rejects read-only entity methods', () => {
    const readOnlyError = 'Links list is read-only';
    const assertReadOnly = (request$: { subscribe: (handlers: { error: (err: Error) => void }) => void }) => {
      let error: Error | undefined;
      request$.subscribe({ error: (err) => (error = err) });
      expect(error?.message).toBe(readOnlyError);
    };

    assertReadOnly(service.get('entry-1'));
    assertReadOnly(service.create(null as never));
    assertReadOnly(service.update('entry-1', null as never));
    assertReadOnly(service.delete('entry-1'));

    httpMock.expectNone('https://api.test/api/v1/links');
  });
});
