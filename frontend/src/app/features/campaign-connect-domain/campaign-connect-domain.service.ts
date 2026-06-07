import { Injectable, inject } from '@angular/core';
import type { MatDialogRef } from '@angular/material/dialog';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DashboardDialogQueueService } from '../dashboard/services/dashboard-dialog-queue.service';
import { resolveSubdomainBaseHost } from '../links/links-aggregation.util';
import {
  CampaignConnectDomainDialogComponent,
  type CampaignConnectDomainDialogData,
  type CampaignConnectDomainDialogResult,
} from './campaign-connect-domain-dialog.component';

@Injectable({ providedIn: 'root' })
export class CampaignConnectDomainService {
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly dialogQueue = inject(DashboardDialogQueueService);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly domainGroupStore = inject(DomainGroupStore);

  openDialog(
    data?: Partial<CampaignConnectDomainDialogData>,
  ): MatDialogRef<
    CampaignConnectDomainDialogComponent,
    CampaignConnectDomainDialogResult | undefined
  > {
    this.domainGroupStore.searchList();
    const configuredBaseUrl = this.appConfig.APP_SUBDOMAIN_BASE_URL || this.appConfig.APP_BASE_URL;
    const dialogData: CampaignConnectDomainDialogData = {
      subdomainBaseHost: resolveSubdomainBaseHost(configuredBaseUrl),
      domainGroups: data?.domainGroups ?? this.domainGroupStore.selectList()(),
      ...data,
    };

    return this.dialogQueue.openBlocking(() =>
      this.wizardDialog.openWizard<
        CampaignConnectDomainDialogComponent,
        CampaignConnectDomainDialogData,
        CampaignConnectDomainDialogResult
      >(CampaignConnectDomainDialogComponent, dialogData),
    );
  }
}
