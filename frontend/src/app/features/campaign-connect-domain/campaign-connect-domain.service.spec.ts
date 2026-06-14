import { TestBed } from '@angular/core/testing';
import type { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { DashboardDialogQueueService } from '../dashboard/services/dashboard-dialog-queue.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { CampaignConnectDomainDialogComponent } from './campaign-connect-domain-dialog.component';
import { CampaignConnectDomainService } from './campaign-connect-domain.service';

describe('CampaignConnectDomainService', () => {
  let service: CampaignConnectDomainService;
  let wizardOpen: ReturnType<typeof vi.fn>;
  let afterClosed$: Subject<unknown>;
  let dialogQueue: DashboardDialogQueueService;
  const searchList = vi.fn();
  const domainGroups = [
    {
      id: 'dg-1',
      name: 'Launch site',
      organizationId: 'org-1',
      robotsPolicy: 'NONE',
      redirectDeliveryMode: 'INSTANT',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    afterClosed$ = new Subject();
    searchList.mockClear();
    wizardOpen = vi.fn().mockReturnValue({
      afterClosed: () => afterClosed$.asObservable(),
    } as MatDialogRef<unknown>);

    TestBed.configureTestingModule({
      providers: [
        CampaignConnectDomainService,
        DashboardDialogQueueService,
        { provide: WizardDialogService, useValue: { openWizard: wizardOpen } },
        {
          provide: DomainGroupStore,
          useValue: {
            searchList,
            selectList: () => () => domainGroups,
          },
        },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_SUBDOMAIN_BASE_URL: 'https://go.linkshift.app',
            APP_BASE_URL: 'https://app.linkshift.app',
          },
        },
      ],
    });

    service = TestBed.inject(CampaignConnectDomainService);
    dialogQueue = TestBed.inject(DashboardDialogQueueService);
  });

  it('openDialog opens wizard with resolved subdomain base host', () => {
    service.openDialog();

    expect(searchList).toHaveBeenCalled();
    expect(wizardOpen).toHaveBeenCalledWith(
      CampaignConnectDomainDialogComponent,
      expect.objectContaining({
        subdomainBaseHost: 'go.linkshift.app',
        domainGroups,
      }),
    );
  });

  it('openDialog merges caller data into dialog payload', () => {
    service.openDialog({ domainGroupId: 'dg-1', existingWorkspaceName: 'Launch' });

    expect(wizardOpen).toHaveBeenCalledWith(
      CampaignConnectDomainDialogComponent,
      expect.objectContaining({
        subdomainBaseHost: 'go.linkshift.app',
        domainGroupId: 'dg-1',
        existingWorkspaceName: 'Launch',
      }),
    );
  });

  it('openDialog marks the dialog queue busy until closed', () => {
    service.openDialog();

    expect(dialogQueue.isIdle).toBe(false);

    afterClosed$.next(undefined);

    expect(dialogQueue.isIdle).toBe(true);
  });

  it('openDialog defers while another blocking dialog is active', () => {
    const firstAfterClosed$ = new Subject<void>();
    wizardOpen.mockReturnValueOnce({
      afterClosed: () => firstAfterClosed$.asObservable(),
    } as MatDialogRef<unknown>);

    service.openDialog();
    wizardOpen.mockClear();

    service.openDialog();

    expect(wizardOpen).not.toHaveBeenCalled();

    firstAfterClosed$.next(undefined);

    expect(wizardOpen).toHaveBeenCalledTimes(1);
  });
});
