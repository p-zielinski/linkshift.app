import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DashboardContextService } from './dashboard-context.service';

const STORAGE_KEY = 'linkshift-active-domain-group';

describe('DashboardContextService', () => {
  let service: DashboardContextService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });

    service = TestBed.inject(DashboardContextService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to empty selection when no stored value', () => {
    expect(service.selectedDomainGroupId()).toBe('');
  });

  it('persists selection to localStorage', () => {
    service.setSelectedDomainGroupId('group-1');

    expect(service.selectedDomainGroupId()).toBe('group-1');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('group-1');
  });

  it('reads stored selection on init', () => {
    localStorage.setItem(STORAGE_KEY, 'group-2');

    const freshService = TestBed.runInInjectionContext(() => new DashboardContextService());

    expect(freshService.selectedDomainGroupId()).toBe('group-2');
  });

  it('reconcileAvailableGroups picks stored id when valid', () => {
    localStorage.setItem(STORAGE_KEY, 'group-b');

    const freshService = TestBed.runInInjectionContext(() => new DashboardContextService());
    freshService.reconcileAvailableGroups([
      { id: 'group-a' },
      { id: 'group-b' },
    ]);

    expect(freshService.selectedDomainGroupId()).toBe('group-b');
  });

  it('reconcileAvailableGroups auto-selects a single group', () => {
    service.reconcileAvailableGroups([{ id: 'only-group' }]);

    expect(service.selectedDomainGroupId()).toBe('only-group');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('only-group');
  });

  it('clears selection when no groups remain', () => {
    service.setSelectedDomainGroupId('group-1');
    service.reconcileAvailableGroups([]);

    expect(service.selectedDomainGroupId()).toBe('');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('reconcileAvailableGroups clears selection when all sites is allowed', () => {
    service.setSelectedDomainGroupId('missing-group');

    service.reconcileAvailableGroups([{ id: 'group-a' }, { id: 'group-b' }], {
      allowEmptySelection: true,
    });

    expect(service.selectedDomainGroupId()).toBe('');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('reconcileAvailableGroups picks the first group when all sites is not allowed', () => {
    service.setSelectedDomainGroupId('missing-group');

    service.reconcileAvailableGroups([{ id: 'group-a' }, { id: 'group-b' }]);

    expect(service.selectedDomainGroupId()).toBe('group-a');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('group-a');
  });

  it('keeps in-memory selection when localStorage persist fails', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });

    service.setSelectedDomainGroupId('group-1');

    expect(service.selectedDomainGroupId()).toBe('group-1');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    setItemSpy.mockRestore();
  });
});
