import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { form, validate, FormField } from '@angular/forms/signals';
import { SITE_CONFIG } from '../../core/config/site-config';
import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthStore } from '../../core/store/auth.store';
import { mapAuthUser } from '../../core/legal/map-auth-user';
import { needsLegalConsent } from '../../core/legal/legal-consent.utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-legal-consent-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink,
    FormField
  ],
  templateUrl: './legal-consent-page.component.html',
  styleUrl: './legal-consent-page.component.css'
})
export class LegalConsentPageComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly busy = signal(false);
  readonly consentModel = signal({
    acceptTerms: false,
    acceptPrivacy: false,
    confirmAge: false
  });

  readonly consentForm = form(this.consentModel, (f) => {
    validate(f.acceptTerms, ({ value }) => {
      if (!value()) {
        return { kind: 'required', message: 'Accept the Terms of Service to continue' };
      }
      return undefined;
    });
    validate(f.acceptPrivacy, ({ value }) => {
      if (!value()) {
        return { kind: 'required', message: 'Accept the Privacy Policy to continue' };
      }
      return undefined;
    });
    validate(f.confirmAge, ({ value }) => {
      if (!value()) {
        return {
          kind: 'required',
          message: `You must confirm you are at least ${this.siteConfig.minAge} years old`
        };
      }
      return undefined;
    });
  });

  readonly termsError = computed(() => this.getFieldError(this.consentForm.acceptTerms()));
  readonly privacyError = computed(() => this.getFieldError(this.consentForm.acceptPrivacy()));
  readonly ageError = computed(() => this.getFieldError(this.consentForm.confirmAge()));

  async submit(): Promise<void> {
    if (
      !this.consentForm.acceptTerms().valid() ||
      !this.consentForm.acceptPrivacy().valid() ||
      !this.consentForm.confirmAge().valid()
    ) {
      this.consentForm.acceptTerms().markAsTouched();
      this.consentForm.acceptPrivacy().markAsTouched();
      this.consentForm.confirmAge().markAsTouched();
      return;
    }

    this.busy.set(true);
    try {
      const payload = this.consentModel();
      const response = await firstValueFrom(this.authApi.acceptLegalConsent(payload));
      if (!response?.user) {
        this.snackBar.open(
          'Consent saved, but the account profile did not refresh. Reload the page and try again.',
          'Dismiss',
          { duration: 6000 },
        );
        return;
      }

      const acceptedUser = mapAuthUser(response.user);
      this.authStore.setUser(acceptedUser);

      const user = this.authStore.user();
      if (needsLegalConsent(user, this.siteConfig)) {
        const acceptedVersion = user?.legalVersion ?? 'unknown';
        const requiredVersion = this.siteConfig.legalVersion;
        this.snackBar.open(
          `Consent recorded as ${acceptedVersion}, but this app requires ${requiredVersion}. Set LEGAL_VERSION and APP_LEGAL_VERSION to the same value, then try again.`,
          'Dismiss',
          { duration: 8000 },
        );
        return;
      }

      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Consent update failed.';
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
