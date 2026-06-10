import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { AppSidebarNavItemComponent } from './app-sidebar-nav-item.component';
import type { NavItem } from './dashboard-nav.config';

const NAV_ITEM: NavItem = {
  label: 'Domains',
  route: '/domains',
  icon: 'public',
};

describe('AppSidebarNavItemComponent', () => {
  let fixture: ComponentFixture<AppSidebarNavItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSidebarNavItemComponent],
      providers: [
        provideRouter([
          { path: 'domains', children: [] },
          { path: 'analytics', children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSidebarNavItemComponent);
    fixture.componentRef.setInput('item', NAV_ITEM);
  });

  it('renders an interactive router link when enabled', () => {
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a.mat-mdc-list-item') as HTMLAnchorElement;

    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain('/domains');
    expect(fixture.nativeElement.querySelector('button.mat-mdc-list-item')).toBeNull();
  });

  it('renders a native disabled button with screen-reader reason when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('disabledTooltip', 'Add a site first');
    fixture.componentRef.setInput('disabledReason', 'Add a site first');
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('span.block') as HTMLSpanElement;
    const button = fixture.nativeElement.querySelector(
      'button.mat-mdc-list-item',
    ) as HTMLButtonElement;

    expect(wrapper).toBeTruthy();
    expect(button).toBeTruthy();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('tabindex')).toBe('-1');
    expect(button.hasAttribute('mattooltip')).toBe(false);

    const reason = fixture.nativeElement.querySelector('.sr-only') as HTMLSpanElement;

    expect(reason?.textContent?.trim()).toBe('Add a site first');
  });

  it('puts the disabled tooltip on a wrapper span so hover works for sighted users', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('disabledTooltip', 'Add a site first');
    fixture.detectChanges();

    const wrapperDebug = fixture.debugElement.query(By.css('span.block'));
    const tooltip = wrapperDebug.injector.get(MatTooltip);

    expect(tooltip.message).toBe('Add a site first');
    expect(tooltip.disabled).toBe(false);
  });

  it('omits screen-reader reason when disabledReason is empty', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sr-only')).toBeNull();
  });

  it('sets aria-current=page on the active route link', async () => {
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/domains');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a.mat-mdc-list-item') as HTMLAnchorElement;

    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('keeps the nav item active when the current URL has extra query params', async () => {
    const router = TestBed.inject(Router);
    fixture.componentRef.setInput('item', {
      label: 'Analytics',
      route: '/analytics',
      icon: 'analytics',
    });
    fixture.detectChanges();

    await router.navigateByUrl(
      '/analytics?workspace=dmg_test&ruleId=rule_test&linkMapId=lmap_test&linkKey=dsadhhh',
    );
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a.mat-mdc-list-item') as HTMLAnchorElement;

    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.className).toContain('bg-app-accent-soft');
  });
});
