import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardModeService } from './dashboard-mode.service';

const STORAGE_KEY = 'linkshift-dashboard-mode';

describe('DashboardModeService', () => {
  let service: DashboardModeService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });

    service = TestBed.inject(DashboardModeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to campaign mode when no stored value', () => {
    expect(service.mode()).toBe('campaign');
    expect(service.isCampaign()).toBe(true);
    expect(service.isAdvanced()).toBe(false);
  });

  it('persists mode to localStorage on setMode', () => {
    service.setMode('advanced');

    expect(service.mode()).toBe('advanced');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('advanced');
    expect(service.isAdvanced()).toBe(true);
    expect(service.isCampaign()).toBe(false);
  });

  it('reads stored advanced mode on init', () => {
    localStorage.setItem(STORAGE_KEY, 'advanced');

    const freshService = TestBed.runInInjectionContext(() => new DashboardModeService());

    expect(freshService.mode()).toBe('advanced');
    expect(freshService.isAdvanced()).toBe(true);
  });

  it('returns mode-aware default landing path', () => {
    expect(service.defaultLandingPath()).toBe('/overview');

    service.setMode('advanced');
    expect(service.defaultLandingPath()).toBe('/dashboard');
  });

  it('shows page-level workspace filter only in campaign mode', () => {
    expect(service.showPageLevelWorkspaceFilter()).toBe(true);

    service.setMode('advanced');
    expect(service.showPageLevelWorkspaceFilter()).toBe(false);
  });

  it('enterAdvancedMode sets advanced mode and navigates', async () => {
    const navigateByUrl = vi.fn().mockResolvedValue(true);
    const router = { navigateByUrl } as unknown as Router;

    const result = await service.enterAdvancedMode(router, '/redirect-rules');

    expect(service.mode()).toBe('advanced');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('advanced');
    expect(navigateByUrl).toHaveBeenCalledWith('/redirect-rules');
    expect(result).toBe(true);
  });
});
