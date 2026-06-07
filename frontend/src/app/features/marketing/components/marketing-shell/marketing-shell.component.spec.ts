import { Component, DebugElement, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  provideRouter,
  Router,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { DEFAULT_SITE_CONFIG, SITE_CONFIG } from '../../../../core/config/site-config';
import { AuthStore } from '../../../../core/store/auth.store';
import { DashboardModeService } from '../../../../core/layout/dashboard-mode.service';
import { MarketingShellComponent } from './marketing-shell.component';

@Component({ standalone: true, template: '' })
class RouteStubComponent {}

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class TestHostComponent {}

function desktopNavLink(root: DebugElement, label: string): DebugElement | undefined {
  return root
    .queryAll(By.css('nav.hidden a[mat-button]'))
    .find((link) => link.nativeElement.textContent?.trim() === label);
}

describe('MarketingShellComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideRouter([
          {
            path: '',
            component: MarketingShellComponent,
            children: [
              { path: 'blog', component: RouteStubComponent },
              { path: '', component: RouteStubComponent },
            ],
          },
        ]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: SITE_CONFIG, useValue: DEFAULT_SITE_CONFIG },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: signal(true),
            refreshTokens: vi.fn(),
            fetchSession: vi.fn(),
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

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('requires exact matching for the Home nav link', async () => {
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const shell = fixture.debugElement.query(By.directive(MarketingShellComponent));
    const homeLink = desktopNavLink(shell, 'Home');
    const options = homeLink?.injector.get(RouterLinkActive).routerLinkActiveOptions;
    expect(options).toEqual(expect.objectContaining({ exact: true }));
  });
});
