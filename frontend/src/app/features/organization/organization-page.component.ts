import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { form, required, FormField } from '@angular/forms/signals';
import { z } from 'zod';
import { applyZodField } from '../../core/forms/zod-validators';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationMembersStore } from '../../core/store/organization-members.store';
import { OrganizationMembersApiService } from '../../core/api/organization-members-api.service';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { OrganizationConfiguration } from '@shared/models/organization-config.model';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { firstValueFrom } from 'rxjs';

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
    FormField,
    PageHeaderComponent
  ],
  templateUrl: './organization-page.component.html',
  styleUrl: './organization-page.component.css'
})
export class OrganizationPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly membersStore = inject(OrganizationMembersStore);
  private readonly membersApi = inject(OrganizationMembersApiService);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly snackBar = inject(MatSnackBar);

  readonly columns = ['email', 'role', 'status', 'verified', 'actions'];
  readonly members = computed(() => this.membersStore.members());
  readonly loading = computed(() => this.membersStore.isLoading());
  readonly error = computed(() => this.membersStore.error());
  readonly isOwner = computed(() => !!this.authStore.user()?.isOwner);

  readonly config = computed(() => {
    const org = this.authStore.organization();
    return OrganizationConfiguration.fromJson(org?.configuration ?? {});
  });
  readonly maxUsers = computed(() => this.config().activeSubscription.limits.maxUsers);
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

  readonly inviteBusy = signal(false);
  readonly inviteFormModel = signal({ email: '' });
  readonly inviteForm = form(this.inviteFormModel, (f) => {
    required(f.email);
    applyZodField(f.email, z.string().email('Invalid email address'));
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

    effect(() => {
      const error = this.error();
      if (!error) {
        return;
      }
      this.snackBar.open(error, 'Dismiss', { duration: 4000 });
      this.membersStore.clearError();
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
      this.inviteFormModel.set({ email: '' });
      this.snackBar.open('Invite sent. It expires in 30 minutes.', 'Dismiss', {
        duration: 4000
      });
    } catch (error) {
      const message = extractErrorMessage(error, 'Unable to send invite.');
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

  statusLabel(member: { isBlocked: boolean }): string {
    return member.isBlocked ? 'Blocked' : 'Active';
  }

  statusClass(member: { isBlocked: boolean }): string {
    return member.isBlocked ? 'status-pill status-pill--danger' : 'status-pill status-pill--success';
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
