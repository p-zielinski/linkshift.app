import { PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { AuthStore } from '../../../core/store/auth.store';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { DocumentationContentService } from '../services/documentation-content.service';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { DocumentationShellComponent } from './documentation-shell.component';

describe('DocumentationShellComponent', () => {
  let fixture: ComponentFixture<DocumentationShellComponent>;
  let component: DocumentationShellComponent;
  let isAuthenticated: WritableSignal<boolean>;

  beforeEach(async () => {
    localStorage.clear();
    isAuthenticated = signal(false);

    await TestBed.configureTestingModule({
      imports: [DocumentationShellComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: { isAuthenticated },
        },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: vi.fn().mockReturnValue(of({ matches: false, breakpoints: {} })),
            isMatched: vi.fn().mockReturnValue(false),
          },
        },
        {
          provide: DocumentationOpenApiService,
          useValue: {
            load: vi.fn(),
            loading: signal(false),
            tagGroups: signal([]),
          },
        },
        {
          provide: DocumentationContentService,
          useValue: {
            sidebarNavGroups: [],
          },
        },
        {
          provide: DocumentationScrollService,
          useValue: {
            registerMainBodyScroll: vi.fn(),
            recordSidebarNavScroll: vi.fn(),
            restoreSidebarNavScrollIfPending: vi.fn(),
          },
        },
        DashboardModeService,
      ],
    }).compileComponents();

    TestBed.inject(DashboardModeService).setMode('campaign');

    fixture = TestBed.createComponent(DocumentationShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('includes Sign in and Start now for guests in site links', () => {
    const links = component.siteLinks();

    expect(links.map((link) => link.label)).toEqual([
      'Home',
      'Use Cases',
      'Docs',
      'Blog',
      'Pricing',
      'Contact',
      'Sign in',
      'Start now',
    ]);
    expect(links.filter((link) => link.label === 'Sign in' || link.label === 'Start now')).toEqual([
      { label: 'Sign in', route: '/auth' },
      { label: 'Start now', route: '/auth' },
    ]);
  });

  it('includes Go to app with dashboard landing path for authenticated users', () => {
    isAuthenticated.set(true);
    fixture.detectChanges();

    const links = component.siteLinks();
    const ctaLinks = links.filter(
      (link) => link.label === 'Go to app' || link.label === 'Sign in' || link.label === 'Start now',
    );

    expect(ctaLinks).toEqual([{ label: 'Go to app', route: '/overview' }]);
  });

  it('uses advanced dashboard landing path when dashboard mode is advanced', () => {
    isAuthenticated.set(true);
    TestBed.inject(DashboardModeService).setMode('advanced');
    fixture.detectChanges();

    const links = component.siteLinks();
    const goToApp = links.find((link) => link.label === 'Go to app');

    expect(goToApp).toEqual({ label: 'Go to app', route: '/dashboard' });
  });
});
