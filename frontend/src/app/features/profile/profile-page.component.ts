import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { form, required, validate, FormField } from '@angular/forms/signals';
import { z } from 'zod';
import { applyZodField } from '../../core/forms/zod-validators';
import { AuthStore } from '../../core/store/auth.store';
import { AuthApiService } from '../../core/api/auth-api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { firstValueFrom } from 'rxjs';
import { SITE_CONFIG } from '../../core/config/site-config';
import { needsLegalConsent } from '../../core/legal/legal-consent.utils';

const emailSchema = z.string().email('Invalid email address');

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormField,
    PageHeaderComponent
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authApi = inject(AuthApiService);
  private readonly snackBar = inject(MatSnackBar);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly user = computed(() => this.authStore.user());
  readonly isVerified = computed(() => !!this.user()?.emailVerifiedAt);
  readonly email = computed(() => this.user()?.email ?? '');
  readonly needsLegalUpdate = computed(() => needsLegalConsent(this.user(), this.siteConfig));

  readonly busy = signal(false);
  readonly changeCodeSent = signal(false);

  readonly emailFormModel = signal({
    newEmail: '',
    code: ''
  });

  readonly emailForm = form(this.emailFormModel, (f) => {
    required(f.newEmail);
    applyZodField(f.newEmail, emailSchema);
    validate(f.code, ({ value }) => {
      if (!this.isVerified()) {
        return undefined;
      }
      if (this.changeCodeSent() && !value()) {
        return { kind: 'required', message: 'Verification code is required' };
      }
      return undefined;
    });
  });

  readonly newEmailError = computed(() => this.getFieldError(this.emailForm.newEmail()));
  readonly codeError = computed(() => this.getFieldError(this.emailForm.code()));

  async resendVerification(): Promise<void> {
    this.busy.set(true);
    try {
      const response = await firstValueFrom(this.authApi.resendVerification());
      if (response.alreadyVerified) {
        this.snackBar.open('Email already verified.', 'Dismiss', { duration: 3000 });
      } else {
        this.snackBar.open('Verification email sent.', 'Dismiss', { duration: 3000 });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to resend verification.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.busy.set(false);
    }
  }

  async submitEmailChange(): Promise<void> {
    if (!this.emailForm.newEmail().valid()) {
      this.emailForm.newEmail().markAsTouched();
      return;
    }

    const newEmail = this.emailFormModel().newEmail.trim();
    if (!newEmail) {
      return;
    }

    this.busy.set(true);
    try {
      if (!this.isVerified()) {
        await firstValueFrom(this.authApi.updateEmailForUnverified({ newEmail }));
        this.authStore.updateUser({ email: newEmail, emailVerifiedAt: null });
        this.snackBar.open('Email updated. Check your inbox to verify.', 'Dismiss', {
          duration: 4000
        });
        return;
      }

      await firstValueFrom(this.authApi.requestEmailChange({ newEmail }));
      this.changeCodeSent.set(true);
      this.snackBar.open('Verification code sent to the new email.', 'Dismiss', {
        duration: 4000
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email update failed.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.busy.set(false);
    }
  }

  async confirmEmailChange(): Promise<void> {
    if (!this.isVerified()) {
      return;
    }
    if (!this.emailForm.code().valid()) {
      this.emailForm.code().markAsTouched();
      return;
    }

    const code = this.emailFormModel().code.trim();
    if (!code) {
      return;
    }

    this.busy.set(true);
    try {
      await firstValueFrom(this.authApi.confirmEmailChange({ code }));
      const newEmail = this.emailFormModel().newEmail.trim();
      this.authStore.updateUser({ email: newEmail, emailVerifiedAt: new Date().toISOString() });
      this.snackBar.open('Email updated successfully.', 'Dismiss', { duration: 4000 });
      this.changeCodeSent.set(false);
      this.emailFormModel.set({ newEmail: '', code: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email confirmation failed.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.busy.set(false);
    }
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
