import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { form, required, FormField } from '@angular/forms/signals';
import { z } from 'zod';
import { applyZodField } from '../../core/forms/zod-validators';
import { EMAIL_MAX_LENGTH } from '../../core/forms/validation.constants';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationMembersStore } from '../../core/store/organization-members.store';
import { OrganizationMembersApiService } from '../../core/api/organization-members-api.service';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { BillingInterval, OrganizationStatus } from '@shared/models/organization-config.model';
import { UpgradeDialogComponent } from '../billing/upgrade-dialog/upgrade-dialog.component';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { firstValueFrom } from 'rxjs';
import { resolveOrganizationConfig } from '../../core/utils/organization-config.util';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { resolveUsageDestination } from '../../core/layout/dashboard-usage-destination.util';
import { SetupChecklistService } from '../../shared/components/setup-checklist/setup-checklist.service';
import {
  buildOrganizationMemberRowViews,
  type OrganizationMemberRowViewModel,
} from './organization-page.util';

@Component({
  selector: 'app-organization-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    RouterLink,
    FormField,
    ResourcePageShellComponent,
    ResourceTableCardComponent,
  ],
  templateUrl: './organization-page.component.html',
  styleUrl: './organization-page.component.css',
  host: {
    '[style.--seat-width.%]': 'seatUsagePercent()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly membersStore = inject(OrganizationMembersStore);
  private readonly membersApi = inject(OrganizationMembersApiService);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly dashboardModeService = inject(DashboardModeService);
  private readonly setupChecklist = inject(SetupChecklistService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly usageDestination = computed(() =>
    resolveUsageDestination(this.dashboardModeService.mode()),
  );

  readonly columns = ['email', 'role', 'status', 'verified', 'actions'];
  readonly members = computed(() => this.membersStore.members());
  readonly memberRowViews = computed(() => buildOrganizationMemberRowViews(this.members()));
  readonly loading = computed(() => this.membersStore.isLoading());
  readonly error = computed(() => this.membersStore.error());
  readonly isOwner = computed(() => !!this.authStore.user()?.isOwner);

  readonly config = computed(() =>
    resolveOrganizationConfig(this.authStore.organization()?.configuration),
  );
  readonly activeSubscription = computed(() => this.config().activeSubscription);
  readonly limits = computed(() => this.config().activeSubscription.limits);
  readonly usage = computed(() => this.usageStore.usage());
  readonly usageLoading = computed(() => this.usageStore.isLoading());
  readonly usageError = computed(() => this.usageStore.error());
  readonly maxUsers = computed(() => this.limits().maxUsers);
  readonly domainLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.domains >= this.limits().maxTotalDomains;
  });
  readonly ruleLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.rules >= this.limits().maxTotalRules;
  });
  readonly userLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.users >= this.limits().maxUsers;
  });
  readonly linkMapLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.linkMaps >= this.limits().maxLinkMaps;
  });
  readonly maxApiKeys = computed(() => this.config().activeSubscription.limits.maxApiKeys);
  readonly apiCallsPerMinute = computed(
    () => this.config().activeSubscription.limits.apiKeyCallsPerMinute,
  );
  readonly apiKeyQuotaLabel = computed(() =>
    this.maxApiKeys() === null ? 'Unlimited' : String(this.maxApiKeys()),
  );
  readonly activeUsers = computed(() => this.usageStore.usage()?.users ?? 0);
  readonly seatsAvailable = computed(() => this.activeUsers() < this.maxUsers());
  readonly seatUsagePercent = computed(() => {
    const max = this.maxUsers();
    if (!max || max <= 0) {
      return 0;
    }
    const used = this.activeUsers();
    const percent = Math.round((used / max) * 100);
    return Math.min(100, Math.max(0, percent));
  });
  readonly seatProgressAriaValueNow = computed(() => this.activeUsers());
  readonly seatProgressAriaValueMax = computed(() => this.maxUsers());
  readonly seatProgressAriaLabel = computed(
    () => `${this.activeUsers()} of ${this.maxUsers()} team seats used`,
  );

  readonly inviteBusy = signal(false);
  readonly inviteFormModel = signal({ email: '' });
  readonly inviteForm = form(this.inviteFormModel, (f) => {
    required(f.email);
    applyZodField(
      f.email,
      z
        .string()
        .email('Invalid email address')
        .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters`),
    );
  });
  readonly inviteEmailError = computed(() => this.getFieldError(this.inviteForm.email()));
  readonly inviteEmailValue = computed(() => this.inviteFormModel().email.trim());
  readonly inviteDisabledReason = computed(() => {
    if (!this.isOwner()) {
      return 'Only organization owners can send invites.';
    }
    if (!this.inviteEmailValue()) {
      return 'Enter an email address to invite.';
    }
    if (!this.inviteForm.email().valid()) {
      return 'Enter a valid email address.';
    }
    if (!this.seatsAvailable()) {
      return 'All seats are currently used. Upgrade to invite more teammates.';
    }
    if (this.inviteBusy()) {
      return 'Invite is already being sent.';
    }
    return null;
  });
  readonly inviteDisabled = computed(() => !!this.inviteDisabledReason());
  readonly inviteTooltip = computed(() => this.inviteDisabledReason());

  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.membersStore.loadMembers();
        this.usageStore.loadUsage();
      }
    });

  }

  retryLoadMembers(): void {
    this.membersStore.loadMembers(true);
  }

  retryLoadUsage(): void {
    this.usageStore.loadUsage(true);
  }

  openUpgradeDialog(): void {
    const activeSubscription = this.activeSubscription();
    const currentInterval: BillingInterval =
      activeSubscription.interval === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

    this.dialog.open(UpgradeDialogComponent, {
      data: {
        currentPlan: activeSubscription.plan,
        currentInterval,
        currentStatus: activeSubscription.status as OrganizationStatus,
        hasProviderSubscription: !!activeSubscription.providerSubscriptionId,
      },
      closeOnNavigation: true,
      maxWidth: '960px',
      width: 'min(960px, 96vw)',
    });
  }

  async sendInvite(): Promise<void> {
    if (this.inviteDisabled()) {
      if (!this.inviteForm.email().valid()) {
        this.inviteForm.email().markAsTouched();
      }
      return;
    }
    const email = this.inviteFormModel().email.trim();
    if (!email) {
      this.inviteForm.email().markAsTouched();
      return;
    }

    this.inviteBusy.set(true);
    try {
      await firstValueFrom(this.membersApi.inviteMember(email));
      this.setupChecklist.markInviteSent();
      this.inviteFormModel.set({ email: '' });
      this.membersStore.loadMembers(true);
      this.usageStore.loadUsage(true);
      this.snackBar.open('Invite sent. It expires in 30 minutes.', 'Dismiss', {
        duration: 4000
      });
    } catch (error) {
      const message = extractErrorMessage(error, "Couldn't send invite.");
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.inviteBusy.set(false);
    }
  }

  toggleBlocked(memberId: string, blocked: boolean): void {
    if (!this.isOwner()) {
      return;
    }
    this.membersStore.updateMemberStatus({ userId: memberId, blocked });
  }

  trackRow(_index: number, row: OrganizationMemberRowViewModel): string {
    return row.member.id;
  }

  private getFieldError(field: any): string | null {
    if (!field.touched()) {
      return null;
    }

    const errors = field.errors?.();
    if (!errors || errors.length === 0) {
      return null;
    }

    return errors[0].message ?? 'Invalid value';
  }
}
