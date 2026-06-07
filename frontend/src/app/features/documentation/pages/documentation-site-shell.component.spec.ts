import { Component, DebugElement, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { AuthStore } from '../../../core/store/auth.store';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { DocumentationSiteShellComponent } from './documentation-site-shell.component';

@Component({ standalone: true, template: '' })
class RouteStubComponent {}

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class TestHostComponent {}

function desktopToolbarCtaButtons(root: DebugElement): DebugElement[] {
  return root.queryAll(By.css('.hidden.items-center.gap-2.md\\:inline-flex a'));
}

describe('DocumentationSiteShellComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let router: Router;
  let isAuthenticated: WritableSignal<boolean>;

  beforeEach(async () => {
    localStorage.clear();
    isAuthenticated = signal(false);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideRouter([
          {
            path: 'docs',
            component: DocumentationSiteShellComponent,
            children: [{ path: '', component: RouteStubComponent }],
          },
        ]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated,
            refreshTokens: vi.fn().mockReturnValue(of({})),
            fetchSession: vi.fn().mockReturnValue(of({})),
          },
        },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: vi.fn().mockReturnValue(of({ matches: false, breakpoints: {} })),
            isMatched: vi.fn().mockReturnValue(false),
          },
        },
        DashboardModeService,
      ],
    }).compileComponents();

    TestBed.inject(DashboardModeService).setMode('campaign');

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TestHostComponent);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows Sign in and Start now for guests in the desktop toolbar', async () => {
    await router.navigateByUrl('/docs');
    fixture.detectChanges();

    const shell = fixture.debugElement.query(By.directive(DocumentationSiteShellComponent));
    const labels = desktopToolbarCtaButtons(shell).map((button) =>
      button.nativeElement.textContent?.trim(),
    );

    expect(labels).toEqual(['Sign in', 'Start now']);
  });

  it('shows Go to app for authenticated users in the desktop toolbar', async () => {
    isAuthenticated.set(true);
    await router.navigateByUrl('/docs');
    fixture.detectChanges();

    const shell = fixture.debugElement.query(By.directive(DocumentationSiteShellComponent));
    const buttons = desktopToolbarCtaButtons(shell);
    const labels = buttons.map((button) => button.nativeElement.textContent?.trim());

    expect(labels).toEqual(['Go to app']);
    expect(buttons[0]?.injector.get(RouterLink).href).toBe('/overview');
  });
});
