import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { sidebarNavLinkActiveOptions, type NavItem } from './dashboard-nav.config';

@Component({
  selector: 'app-sidebar-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatTooltipModule],
  template: `
    @if (disabled()) {
      <span
        class="block"
        [matTooltip]="disabledTooltip()"
        [matTooltipDisabled]="!disabledTooltip()"
      >
        <button
          mat-list-item
          type="button"
          disabled
          [attr.aria-disabled]="true"
          [attr.tabindex]="-1"
          class="cursor-not-allowed opacity-50"
        >
          <mat-icon class="relative top-[-1px] mr-3 align-middle text-[20px]">{{ item().icon }}</mat-icon>
          <span>{{ item().label }}</span>
          @if (disabledReason()) {
            <span class="sr-only">{{ disabledReason() }}</span>
          }
        </button>
      </span>
    } @else if (item().openInNewTab) {
      <a
        mat-list-item
        class="cursor-pointer"
        [routerLink]="item().route"
        target="_blank"
        rel="noopener noreferrer"
        [attr.aria-label]="item().label + ' (opens in new tab)'"
        (click)="navigate.emit()"
      >
        <mat-icon class="relative top-[-2px] mr-3 align-middle text-[20px]">{{ item().icon }}</mat-icon>
        <span>{{ item().label }}</span>
      </a>
    } @else {
      <a
        mat-list-item
        class="cursor-pointer"
        [routerLink]="item().route"
        routerLinkActive="rounded-xl bg-app-accent-soft"
        #navLinkActive="routerLinkActive"
        [routerLinkActiveOptions]="navLinkActiveOptions(item().matchSubRoutes)"
        [attr.aria-current]="navLinkActive.isActive ? 'page' : null"
        (click)="navigate.emit()"
      >
        <mat-icon class="relative top-[-2px] mr-3 align-middle text-[20px]">{{ item().icon }}</mat-icon>
        <span>{{ item().label }}</span>
      </a>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebarNavItemComponent {
  protected readonly navLinkActiveOptions = sidebarNavLinkActiveOptions;

  readonly item = input.required<NavItem>();
  readonly disabled = input(false);
  readonly disabledTooltip = input('');
  readonly disabledReason = input('');
  readonly navigate = output<void>();
}
