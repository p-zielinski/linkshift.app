import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { DOMAIN_SETUP_CONFIG } from '../../core/config/domain-setup-config';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { WizardComponent } from '../../shared/components/wizard/wizard.component';
import { CampaignConnectDomainDialogComponent } from './campaign-connect-domain-dialog.component';

const sampleDomainGroups = [
  { id: 'group-1', name: 'Launch site' },
  { id: 'group-2', name: 'Retail site' },
] as const;

describe('CampaignConnectDomainDialogComponent', () => {
  const closeMock = vi.fn();

  const configure = (dialogData: Record<string, unknown>) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CampaignConnectDomainDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: { close: closeMock },
        },
        {
          provide: DOMAIN_SETUP_CONFIG,
          useValue: { targetIp: '203.0.113.10' },
        },
        {
          provide: DomainGroupStore,
          useValue: {
            searchList: vi.fn(),
          },
        },
      ],
    });
  };

  beforeEach(() => {
    closeMock.mockClear();
    configure({
      subdomainBaseHost: 'go.linkshift.app',
      domainGroups: [],
    });
  });

  it('shows Cancel on wizard close before provisioning', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.activeStepId.set('host');
    expect(component.cancelLabel()).toBe('Cancel');
  });

  it('shows Done on wizard close after provisioning', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.provisioned.set(true);
    component.activeStepId.set('done');
    component.connectedHost.set('launch.go.linkshift.app');
    component.connectedDomainGroupId.set('group-1');
    fixture.detectChanges();

    expect(component.cancelLabel()).toBe('Done');
  });

  it('closes with success result when canceling after provisioning', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.provisioned.set(true);
    component.connectedHost.set('launch.go.linkshift.app');
    component.connectedDomainGroupId.set('group-1');
    component.onCancel();

    expect(closeMock).toHaveBeenCalledWith({
      connected: true,
      domainGroupId: 'group-1',
      host: 'launch.go.linkshift.app',
      addedHostToExistingSite: false,
    });
  });

  it('shows Connecting… on save label while pending on host step', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.activeStepId.set('host');
    component.pending.set(true);

    expect(component.saveLabel()).toBe('Connecting…');
  });

  it('detects custom domain done state after provisioning', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    expect(component.isCustomDomainConnected()).toBe(false);

    component.model.update((current) => ({
      ...current,
      hostKind: 'custom-domain',
      customDomainName: 'links.example.com',
    }));
    component.provisioned.set(true);
    component.connectedHost.set('links.example.com');
    fixture.detectChanges();

    expect(component.isCustomDomainConnected()).toBe(true);
    expect(component.hasTargetIp()).toBe(true);
    expect(component.targetIp()).toBe('203.0.113.10');

    const doneStep = component.steps().find((step) => step.id === 'done');
    expect(doneStep?.title).toBe('Configure DNS');
    expect(doneStep?.description).toBe(
      'Point your domain to LinkShift before short links work.',
    );
  });

  it('keeps subdomain ready messaging on done step', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.model.update((current) => ({
      ...current,
      hostKind: 'subdomain',
      subdomainName: 'launch',
    }));
    component.provisioned.set(true);
    component.connectedHost.set('launch.go.linkshift.app');
    fixture.detectChanges();

    expect(component.isCustomDomainConnected()).toBe(false);

    const doneStep = component.steps().find((step) => step.id === 'done');
    expect(doneStep?.title).toBe('Host connected');
    expect(doneStep?.description).toBe('Your site is ready for short links.');
  });

  it('shows pending finish copy on done step before provisioning', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.model.update((current) => ({
      ...current,
      workspaceMode: 'new',
      workspaceName: 'Summer campaign',
      hostKind: 'subdomain',
      subdomainName: 'launch',
    }));
    fixture.detectChanges();

    const doneStep = component.steps().find((step) => step.id === 'done');
    expect(doneStep?.title).toBe('Finish setup');
    expect(doneStep?.description).toBe('Connect your host to open this step.');
    expect(doneStep?.complete).toBe(false);
    expect(doneStep?.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Connect host first');
    expect(fixture.nativeElement.textContent).not.toContain('Host ready');
  });

  it('starts on host step with two steps in add-host mode', () => {
    configure({
      subdomainBaseHost: 'go.linkshift.app',
      domainGroups: [...sampleDomainGroups],
      domainGroupId: 'group-1',
      existingWorkspaceName: 'Summer campaign',
    });

    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isAddHostMode()).toBe(true);
    expect(component.steps().map((step) => step.id)).toEqual(['host', 'done']);
    expect(component.wizardTitle()).toBe('Add host');
    expect(component.wizardSubtitle()).toBe('Add a host to Summer campaign.');
    expect(component.activeStepId()).toBe('host');
  });

  it('shows site step with existing/new toggle when sites are available', () => {
    configure({
      subdomainBaseHost: 'go.linkshift.app',
      domainGroups: [...sampleDomainGroups],
    });

    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.steps().map((step) => step.id)).toEqual(['site', 'host', 'done']);
    expect(component.hasExistingSites()).toBe(true);
    expect(component.model().workspaceMode).toBe('existing');
    expect(component.steps()[0]?.title).toBe('Choose a site');
    expect(fixture.nativeElement.textContent).toContain('Existing site');
    expect(fixture.nativeElement.textContent).toContain('New site');
    expect(component.domainGroups.map((group) => group.name)).toEqual([
      'Launch site',
      'Retail site',
    ]);
  });

  it('shows first-site copy when no sites exist yet', () => {
    configure({
      subdomainBaseHost: 'go.linkshift.app',
      domainGroups: [],
    });

    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.hasExistingSites()).toBe(false);
    expect(component.steps()[0]?.title).toBe('Name your site');
    expect(component.steps()[0]?.description).toBe('Create a site for your short links.');
    expect(fixture.nativeElement.textContent).toContain('Site name');
    expect(fixture.nativeElement.textContent).not.toContain('Existing site');
  });

  it('shows custom domain validation after host step attempt', async () => {
    configure({
      subdomainBaseHost: 'go.linkshift.app',
      domainGroups: [...sampleDomainGroups],
      domainGroupId: 'group-1',
      existingWorkspaceName: 'Launch site',
    });

    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.model.update((current) => ({
      ...current,
      hostKind: 'custom-domain',
      customDomainName: 'not a domain',
    }));
    fixture.detectChanges();

    await component.onSave();
    fixture.detectChanges();

    expect(component.customDomainError()).toBe('Domain name format is invalid');
    expect(fixture.nativeElement.textContent).toContain('Domain name format is invalid');
  });

  it('shows DNS follow-up copy instead of Create first link for custom domains on done step', () => {
    const fixture = TestBed.createComponent(CampaignConnectDomainDialogComponent);
    const component = fixture.componentInstance;

    component.model.update((current) => ({
      ...current,
      hostKind: 'custom-domain',
      customDomainName: 'links.example.com',
    }));
    component.provisioned.set(true);
    component.connectedHost.set('links.example.com');
    fixture.detectChanges();

    const wizard = fixture.debugElement.query(By.directive(WizardComponent))
      ?.componentInstance as WizardComponent | undefined;
    wizard?.setActiveStep(2);
    fixture.detectChanges();

    const rootText = fixture.nativeElement.textContent ?? '';

    expect(rootText).toContain('After DNS propagates, create short links from Overview or Links');
    expect(rootText).not.toContain('Create first link');
  });
});
