import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import type { DomainGroup } from '../../core/models/domain-group.model';
import type { LinkMap } from '../../core/models/link-map.model';
import type { RedirectRule } from '../../core/models/redirect-rule.model';
import { LinkMapsApiService } from '../../core/api/link-maps-api.service';
import { LinkMapEntriesApiService } from '../../core/api/link-map-entries-api.service';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { WizardComponent } from '../../shared/components/wizard/wizard.component';
import { CreateLinkWizardDialogComponent } from './create-link-wizard-dialog.component';
import { DEFAULT_LINK_MAP_NAME } from './links-provisioning.util';

describe('CreateLinkWizardDialogComponent', () => {
  const domainGroups: DomainGroup[] = [
    {
      id: 'group-1',
      name: 'Marketing',
      organizationId: 'org-1',
      robotsPolicy: 'NONE',
      redirectDeliveryMode: 'INSTANT',
      customRobotsContent: null,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const hostOptions = [
    {
      domainGroupId: 'group-1',
      host: 'promo.example.com',
      label: 'promo.example.com',
      kind: 'custom-domain' as const,
    },
  ];

  const multiHostOptions = [
    {
      domainGroupId: 'group-1',
      host: 'promo.example.com',
      label: 'promo.example.com (custom domain)',
      kind: 'custom-domain' as const,
    },
    {
      domainGroupId: 'group-1',
      host: 'go.example.com',
      label: 'go.example.com (managed subdomain)',
      kind: 'subdomain' as const,
    },
  ];

  const existingMap: LinkMap = {
    id: 'map-1',
    name: DEFAULT_LINK_MAP_NAME,
    domainGroupId: 'group-1',
    caseSensitive: false,
    queryMatch: 'ignore',
    entriesCount: 0,
    createdAt: '',
    updatedAt: '',
  };

  const existingPrefixRule: RedirectRule = {
    id: 'rule-existing',
    source: '/go',
    destination: null,
    statusCode: 302,
    matchMethod: [],
    queryMatch: 'ignore',
    pathMatch: 'prefix',
    linkMapId: 'map-1',
    priority: 0,
    domainGroupId: 'group-1',
    createdAt: '',
    updatedAt: '',
    isBlocked: false,
  };

  let closePayload: unknown;
  let setMode: ReturnType<typeof vi.fn>;
  let dashboardMode: 'campaign' | 'advanced';
  let setSelectedDomainGroupId: ReturnType<typeof vi.fn>;
  let confirmDialogResult: boolean | undefined;
  let openDialog: ReturnType<typeof vi.fn>;
  let copyToClipboard: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    closePayload = undefined;
    dashboardMode = 'campaign';
    setMode = vi.fn();
    setSelectedDomainGroupId = vi.fn();
    confirmDialogResult = true;
    openDialog = vi.fn(() => ({
      afterClosed: () => of(confirmDialogResult),
    }));
    copyToClipboard = vi.fn(() => true);
    navigate = vi.fn(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      imports: [CreateLinkWizardDialogComponent],
      providers: [
        provideRouter([]),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            domainGroups,
            hostOptions,
            linkMaps: [],
            redirectRules: [],
            initialDomainGroupId: 'group-1',
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: (payload: unknown) => {
              closePayload = payload;
            },
          },
        },
        {
          provide: LinkMapsApiService,
          useValue: {
            create: vi.fn(() =>
              of({
                ...existingMap,
                id: 'map-created',
              }),
            ),
          },
        },
        {
          provide: RedirectRulesApiService,
          useValue: {
            create: vi.fn(() =>
              of({
                id: 'rule-created',
                source: '/go',
                destination: null,
                statusCode: 302,
                matchMethod: [],
                queryMatch: 'ignore',
                pathMatch: 'prefix',
                linkMapId: 'map-created',
                priority: 0,
                domainGroupId: 'group-1',
                createdAt: '',
                updatedAt: '',
              }),
            ),
          },
        },
        {
          provide: LinkMapEntriesApiService,
          useValue: {
            create: vi.fn(() =>
              of({
                id: 'entry-created',
                linkMapId: 'map-created',
                key: 'summer-sale',
                destination: 'https://target.example.com',
                createdAt: '',
                updatedAt: '',
              }),
            ),
          },
        },
        {
          provide: DashboardModeService,
          useValue: {
            setMode,
            mode: () => dashboardMode,
          },
        },
        {
          provide: DashboardContextService,
          useValue: {
            setSelectedDomainGroupId,
          },
        },
        {
          provide: Clipboard,
          useValue: {
            copy: copyToClipboard,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate,
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: openDialog,
          },
        },
      ],
    });
  });

  it('shows provisioning disclosure on success when map and rule were created', async () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });
    component.onStepChange('summary');
    fixture.detectChanges();

    const wizard = fixture.debugElement.query(By.directive(WizardComponent))
      .componentInstance as WizardComponent;
    wizard.setActiveStep(3);

    await component.onSave();
    fixture.detectChanges();

    expect(component.provisioningDisclosureVisible()).toBe(true);
    expect(component.sessionCreatedLinkMap()).toBe(true);
    expect(component.sessionCreatedPrefixRule()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Routing setup was created automatically');
  });

  it('hides provisioning disclosure when routing already exists', async () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: {
        domainGroups,
        hostOptions,
        linkMaps: [existingMap],
        redirectRules: [existingPrefixRule],
        initialDomainGroupId: 'group-1',
      },
    });

    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;
    const linkMapsApi = TestBed.inject(LinkMapsApiService);
    const redirectRulesApi = TestBed.inject(RedirectRulesApiService);

    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });
    component.onStepChange('summary');
    fixture.detectChanges();

    const wizard = fixture.debugElement.query(By.directive(WizardComponent))
      .componentInstance as WizardComponent;
    wizard.setActiveStep(3);

    await component.onSave();
    fixture.detectChanges();

    expect(component.provisioningDisclosureVisible()).toBe(false);
    expect(linkMapsApi.create).not.toHaveBeenCalled();
    expect(redirectRulesApi.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).not.toContain('Routing setup was created automatically');
  });

  it('provisions map, prefix rule, and entry when group has no resources', async () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;
    const linkMapsApi = TestBed.inject(LinkMapsApiService);
    const redirectRulesApi = TestBed.inject(RedirectRulesApiService);
    const entriesApi = TestBed.inject(LinkMapEntriesApiService);

    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });
    component.onStepChange('summary');

    expect(component.provisioningPlan().createDefaultMap).toBe(true);
    expect(component.provisioningPlan().createPrefixRule).toBe(true);

    await component.onSave();

    expect(linkMapsApi.create).toHaveBeenCalledTimes(1);
    expect(redirectRulesApi.create).toHaveBeenCalledTimes(1);
    expect(entriesApi.create).toHaveBeenCalledWith({
      linkMapId: 'map-created',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });
    expect(component.isCreated()).toBe(true);

    await component.onSave();

    expect(closePayload).toEqual({
      created: true,
      domainGroupId: 'group-1',
      linkMapId: 'map-created',
      entryId: 'entry-created',
    });
  });

  it('does not create link when Save is triggered before Summary step', async () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;
    const linkMapsApi = TestBed.inject(LinkMapsApiService);
    const redirectRulesApi = TestBed.inject(RedirectRulesApiService);
    const entriesApi = TestBed.inject(LinkMapEntriesApiService);

    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });
    component.onStepChange('destination');

    expect(component.saveDisabled()).toBe(true);

    await component.onSave();

    expect(linkMapsApi.create).not.toHaveBeenCalled();
    expect(redirectRulesApi.create).not.toHaveBeenCalled();
    expect(entriesApi.create).not.toHaveBeenCalled();
    expect(component.isCreated()).toBe(false);
  });

  it('enables Save only on Summary step when form is valid', () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });

    component.onStepChange('path');
    expect(component.saveDisabled()).toBe(true);
    expect(component.saveTooltip()).toBe('Review the summary step to create your link');

    component.onStepChange('summary');
    expect(component.saveDisabled()).toBe(false);
    expect(component.saveTooltip()).toBe('');
  });

  it('passes saveTooltip to wizard when Save is disabled before Summary step', () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.onStepChange('site');
    fixture.detectChanges();

    const wizard = fixture.debugElement.query(By.directive(WizardComponent))
      .componentInstance as WizardComponent;

    expect(component.saveTooltip()).toBe('Review the summary step to create your link');
    expect(wizard.saveTooltip).toBe('Review the summary step to create your link');
    expect(wizard.saveTooltipDisabled).toBe(false);
  });

  it('shows connected hosts as read-only list on Site step', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: {
        domainGroups,
        hostOptions: multiHostOptions,
        linkMaps: [],
        redirectRules: [],
        initialDomainGroupId: 'group-1',
      },
    });

    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Works on these hosts');
    expect(fixture.nativeElement.textContent).toContain('promo.example.com (custom domain)');
    expect(fixture.nativeElement.textContent).toContain('go.example.com (managed subdomain)');
    expect(fixture.nativeElement.textContent).not.toContain('Select host');
    expect(fixture.debugElement.queryAll(By.css('mat-select')).length).toBe(1);
  });

  it('shows multi-host URL variants on summary preview', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: {
        domainGroups,
        hostOptions: multiHostOptions,
        linkMaps: [],
        redirectRules: [],
        initialDomainGroupId: 'group-1',
      },
    });

    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });
    component.onStepChange('summary');
    fixture.detectChanges();

    const wizard = fixture.debugElement.query(By.directive(WizardComponent))
      .componentInstance as WizardComponent;
    wizard.setActiveStep(3);
    fixture.detectChanges();

    expect(component.previewShortPath()).toBe('/go/summer-sale');
    expect(component.previewShortUrls()).toEqual([
      'https://promo.example.com/go/summer-sale',
      'https://go.example.com/go/summer-sale',
    ]);
    expect(fixture.nativeElement.textContent).toContain('/go/summer-sale');
    expect(fixture.nativeElement.textContent).toContain('https://promo.example.com/go/summer-sale');
    expect(fixture.nativeElement.textContent).toContain('https://go.example.com/go/summer-sale');
  });

  it('openConnectDomain closes dialog with connect-domain recovery payload', () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.model.set({
      domainGroupId: 'group-1',
      key: '',
      destination: 'https://',
    });

    component.openConnectDomain();

    expect(closePayload).toEqual({
      created: false,
      openConnectDomain: true,
      domainGroupId: 'group-1',
    });
  });

  it('openAdvancedOptions closes with openAdvanced after confirmation', () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.openAdvancedOptions();

    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(closePayload).toEqual({
      created: false,
      openAdvanced: true,
      domainGroupId: 'group-1',
      linkMapId: undefined,
    });
  });

  it('openAdvancedOptions does nothing when confirmation is cancelled', () => {
    confirmDialogResult = false;

    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.openAdvancedOptions();

    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(closePayload).toBeUndefined();
  });

  async function createLinkOnSummary(component: CreateLinkWizardDialogComponent): Promise<void> {
    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });
    component.onStepChange('summary');
    await component.onSave();
  }

  it('copyCreatedUrl copies first host URL and shows snackbar', async () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;
    const snackBar = fixture.debugElement.injector.get(MatSnackBar);
    const snackBarOpen = vi.spyOn(snackBar, 'open');

    await createLinkOnSummary(component);

    component.copyCreatedUrl();

    expect(copyToClipboard).toHaveBeenCalledWith('https://promo.example.com/go/summer-sale');
    expect(snackBarOpen).toHaveBeenCalledWith('Copied to clipboard.', 'Dismiss', {
      duration: 3000,
    });
    expect(closePayload).toBeUndefined();
  });

  it('copyCreatedUrl copies all host URLs when multiple hosts exist', async () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: {
        domainGroups,
        hostOptions: multiHostOptions,
        linkMaps: [],
        redirectRules: [],
        initialDomainGroupId: 'group-1',
      },
    });

    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    await createLinkOnSummary(component);

    expect(component.createdShortUrls()).toEqual([
      'https://promo.example.com/go/summer-sale',
      'https://go.example.com/go/summer-sale',
    ]);

    component.copyCreatedUrl();

    expect(copyToClipboard).toHaveBeenCalledWith(
      'https://promo.example.com/go/summer-sale\nhttps://go.example.com/go/summer-sale',
    );
  });

  it('openAnalytics closes dialog and navigates with analytics query params in campaign mode', async () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    await createLinkOnSummary(component);

    component.openAnalytics();

    expect(setSelectedDomainGroupId).toHaveBeenCalledWith('group-1');
    expect(closePayload).toEqual({
      created: true,
      domainGroupId: 'group-1',
      linkMapId: 'map-created',
      entryId: 'entry-created',
    });
    expect(navigate).toHaveBeenCalledWith(['/analytics'], {
      queryParams: {
        workspace: 'group-1',
        ruleId: 'rule-created',
        linkMapId: 'map-created',
        linkKey: 'summer-sale',
      },
    });
  });

  it('openAnalytics navigates to redirect-rules-analytics in advanced mode', async () => {
    dashboardMode = 'advanced';
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    await createLinkOnSummary(component);

    component.openAnalytics();

    expect(navigate).toHaveBeenCalledWith(['/redirect-rules-analytics'], {
      queryParams: {
        workspace: 'group-1',
        ruleId: 'rule-created',
        linkMapId: 'map-created',
        linkKey: 'summer-sale',
      },
    });
  });

  it('openQrGenerator closes dialog and navigates to QR tool with first host URL', async () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    await createLinkOnSummary(component);

    component.openQrGenerator();

    expect(closePayload).toEqual({
      created: true,
      domainGroupId: 'group-1',
      linkMapId: 'map-created',
      entryId: 'entry-created',
    });
    expect(navigate).toHaveBeenCalledWith(['/tools/qr-code-generator'], {
      queryParams: {
        url: 'https://promo.example.com/go/summer-sale',
      },
    });
  });

  it('shows Creating… on save label while pending', () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;

    component.pending.set(true);

    expect(component.saveLabel()).toBe('Creating…');
  });

  it('locks navigation after link is created', async () => {
    const fixture = TestBed.createComponent(CreateLinkWizardDialogComponent);
    const component = fixture.componentInstance;
    const entriesApi = TestBed.inject(LinkMapEntriesApiService);

    component.model.set({
      domainGroupId: 'group-1',
      key: 'summer-sale',
      destination: 'https://target.example.com',
    });

    fixture.detectChanges();
    const wizard = fixture.debugElement.query(By.directive(WizardComponent))
      .componentInstance as WizardComponent;
    wizard.setActiveStep(3);
    component.onStepChange('summary');

    await component.onSave();
    fixture.detectChanges();

    expect(component.isCreated()).toBe(true);
    expect(wizard.activeStep()?.id).toBe('summary');

    const steps = component.steps();
    expect(steps.find((step) => step.id === 'site')?.disabled).toBe(true);
    expect(steps.find((step) => step.id === 'path')?.disabled).toBe(true);
    expect(steps.find((step) => step.id === 'destination')?.disabled).toBe(true);
    expect(steps.find((step) => step.id === 'summary')?.disabled).toBeFalsy();

    expect(wizard.canGoBack()).toBe(false);

    wizard.previous();
    expect(wizard.activeStep()?.id).toBe('summary');

    wizard.setActiveStep(0);
    expect(wizard.activeStep()?.id).toBe('summary');

    component.model.update((current) => ({
      ...current,
      key: 'changed-key',
      destination: 'https://changed.example.com',
    }));
    fixture.detectChanges();

    await component.onSave();

    expect(entriesApi.create).toHaveBeenCalledTimes(1);
    expect(closePayload).toEqual({
      created: true,
      domainGroupId: 'group-1',
      linkMapId: 'map-created',
      entryId: 'entry-created',
    });
  });
});
