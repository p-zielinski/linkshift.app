import { PLATFORM_ID, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DashboardContextService } from '../layout/dashboard-context.service';
import { resolveLinksSyncFromDashboardContext } from '../../features/links/links-page-scope.util';
import { DomainGroupFilterPersistenceService } from './domain-group-filter-persistence.service';

describe('DomainGroupFilterPersistenceService', () => {
  let filterModel: ReturnType<typeof signal<{ domainGroupId: string }>>;
  let domainGroups: ReturnType<typeof signal<{ id: string }[]>>;
  let dashboardContext: DashboardContextService;

  beforeEach(() => {
    localStorage.clear();
    filterModel = signal({ domainGroupId: '' });
    domainGroups = signal<{ id: string }[]>([]);

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, DashboardContextService],
    });

    dashboardContext = TestBed.inject(DashboardContextService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function bind(
    options: Parameters<DomainGroupFilterPersistenceService['bind']>[2] = {},
  ): void {
    TestBed.runInInjectionContext(() => {
      TestBed.inject(DomainGroupFilterPersistenceService).bind(
        filterModel,
        domainGroups,
        options,
      );
    });
  }

  it('initializes page filter from dashboard context', () => {
    bind();
    dashboardContext.setSelectedDomainGroupId('group-b');
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('group-b');
  });

  it('syncs page filter when dashboard context changes in advanced mode', () => {
    bind({ syncFromDashboardContext: true });
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();
    filterModel.set({ domainGroupId: 'group-a' });
    TestBed.flushEffects();

    dashboardContext.setSelectedDomainGroupId('group-b');
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('group-b');
  });

  it('syncs dashboard context when page filter changes in advanced mode', () => {
    bind({ syncFromDashboardContext: true });
    dashboardContext.setSelectedDomainGroupId('group-a');
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();

    filterModel.set({ domainGroupId: 'group-b' });
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('group-b');
    expect(dashboardContext.selectedDomainGroupId()).toBe('group-b');
  });

  it('does not overwrite empty page filter from context when allowEmptySelection is set', () => {
    bind({
      allowEmptySelection: true,
      syncFromDashboardContext: false,
    });
    dashboardContext.setSelectedDomainGroupId('group-b');
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();

    filterModel.set({ domainGroupId: '' });
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('');
    expect(dashboardContext.selectedDomainGroupId()).toBe('');
  });

  it('clears dashboard context when campaign page selects all sites', () => {
    bind({
      allowEmptySelection: true,
      syncFromDashboardContext: false,
    });
    dashboardContext.setSelectedDomainGroupId('group-b');
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();
    filterModel.set({ domainGroupId: 'group-a' });
    TestBed.flushEffects();

    filterModel.set({ domainGroupId: '' });
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('');
    expect(dashboardContext.selectedDomainGroupId()).toBe('');
  });

  it('does not pull dashboard context into page filter after init in campaign mode', () => {
    bind({
      allowEmptySelection: computed(() => true),
      syncFromDashboardContext: computed(() => false),
    });
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();
    filterModel.set({ domainGroupId: 'group-a' });
    TestBed.flushEffects();

    dashboardContext.setSelectedDomainGroupId('group-b');
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('group-a');
  });

  it('syncs page filter from dashboard context in campaign when page filter is empty', () => {
    bind({
      allowEmptySelection: computed(() => true),
      syncFromDashboardContext: computed(
        () => !filterModel().domainGroupId && !!dashboardContext.selectedDomainGroupId(),
      ),
    });
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();
    filterModel.set({ domainGroupId: '' });
    TestBed.flushEffects();

    dashboardContext.setSelectedDomainGroupId('group-b');
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('group-b');
  });

  it('updates dashboard context when page filter changes', () => {
    bind();
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();

    filterModel.set({ domainGroupId: 'group-b' });
    TestBed.flushEffects();

    expect(dashboardContext.selectedDomainGroupId()).toBe('group-b');
  });

  it('keeps all sites selection on /links in campaign mode with dynamic shell sync', () => {
    bind({
      allowEmptySelection: computed(() => true),
      syncFromDashboardContext: computed(() =>
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: false,
          pageFilterGroupId: filterModel().domainGroupId,
          shellSelectedGroupId: dashboardContext.selectedDomainGroupId(),
        }),
      ),
    });
    dashboardContext.setSelectedDomainGroupId('group-b');
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();
    expect(filterModel().domainGroupId).toBe('group-b');

    filterModel.set({ domainGroupId: 'group-a' });
    TestBed.flushEffects();

    filterModel.set({ domainGroupId: '' });
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('');
    expect(dashboardContext.selectedDomainGroupId()).toBe('');
  });

  it('keeps all sites selection on /links in advanced mode', () => {
    bind({
      allowEmptySelection: true,
      syncFromDashboardContext: computed(() =>
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: true,
          pageFilterGroupId: filterModel().domainGroupId,
          shellSelectedGroupId: dashboardContext.selectedDomainGroupId(),
        }),
      ),
    });
    dashboardContext.setSelectedDomainGroupId('group-b');
    domainGroups.set([{ id: 'group-a' }, { id: 'group-b' }]);
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('group-b');

    filterModel.set({ domainGroupId: '' });
    TestBed.flushEffects();

    expect(filterModel().domainGroupId).toBe('');
    expect(dashboardContext.selectedDomainGroupId()).toBe('');
  });
});
