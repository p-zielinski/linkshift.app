import { Component, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  form,
  required,
  submit,
  validate,
  FormField
} from '@angular/forms/signals';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { loginSchema, registerSchema } from './auth.schemas';
import { SITE_CONFIG } from '../../core/config/site-config';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { TurnstileService } from '../../core/security/turnstile.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCheckboxModule,
    FormField,
    RouterLink
  ],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css','invite-accept-page.component.css']
})
export class AuthPageComponent {
  readonly authStore = inject(AuthStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly dashboardMode = inject(DashboardModeService);
  readonly siteConfig = inject(SITE_CONFIG);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly turnstile = inject(TurnstileService);

  loginModel = signal({
    email: '',
    password: ''
  });

  registerModel = signal({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
    confirmAge: false
  });

  loginForm = form(this.loginModel, (f) => {
    required(f.email);
    required(f.password);
    applyZodField(f.email, loginSchema.shape.email);
    applyZodField(f.password, loginSchema.shape.password);
  });

  registerForm = form(this.registerModel, (f) => {
    required(f.email);
    required(f.password);
    required(f.confirmPassword);
    applyZodField(f.organizationName, registerSchema.shape.organizationName);
    applyZodField(f.email, registerSchema.shape.email);
    applyZodField(f.password, registerSchema.shape.password);
    applyZodField(f.acceptTerms, registerSchema.shape.acceptTerms);
    applyZodField(f.acceptPrivacy, registerSchema.shape.acceptPrivacy);
    applyZodField(f.confirmAge, registerSchema.shape.confirmAge);

    validate(f.confirmPassword, ({ value, valueOf }) => {
      if (!value()) {
        return { kind: 'required', message: 'Confirm password is required' };
      }
      if (value() !== valueOf(f.password)) {
        return { kind: 'password-mismatch', message: 'Passwords must match' };
      }
      return undefined;
    });
  });

  loginEmailError = computed(() => this.getFieldError(this.loginForm.email()));
  loginPasswordError = computed(() => this.getFieldError(this.loginForm.password()));
  registerOrgError = computed(() => this.getFieldError(this.registerForm.organizationName()));
  registerEmailError = computed(() => this.getFieldError(this.registerForm.email()));
  registerPasswordError = computed(() => this.getFieldError(this.registerForm.password()));
  registerConfirmError = computed(() => this.getFieldError(this.registerForm.confirmPassword()));
  registerTermsError = computed(() => this.getFieldError(this.registerForm.acceptTerms()));
  registerPrivacyError = computed(() => this.getFieldError(this.registerForm.acceptPrivacy()));
  registerAgeError = computed(() => this.getFieldError(this.registerForm.confirmAge()));

  private readonly registerReady = signal(true);
  readonly authGateEnabled = computed(() => {
    return (this.appConfig.APP_AUTH_GATE_ENABLED ?? 'false')
      .toString()
      .toLowerCase() === 'true';
  });
  readonly canAccessAuth = computed(
    () => !this.authGateEnabled() || this.registerReady(),
  );
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());

  goToApp(): void {
    void this.router.navigateByUrl(this.dashboardMode.defaultLandingPath());
  }

  constructor() {
    if (this.authGateEnabled()) {
      this.registerReady.set(false);
      if (isPlatformBrowser(this.platformId)) {
        const flag = localStorage.getItem('register_ready');
        this.registerReady.set(flag === 'true');
      }
    }

    effect(() => {
      const error = this.authStore.error();
      if (!error) {
        return;
      }
      const message = error.trim() || "Couldn't sign in. Try again.";
      this.snackBar.open(message, 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-600', 'text-white']
      });
      this.authStore.clearError();
    });
  }

  async onLogin(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.loginForm, async (formValue) => {
      try {
        const turnstileToken = await this.turnstile.requestToken();
        await firstValueFrom(this.authStore.login(formValue().value(), turnstileToken));
        this.turnstile.reset();
        await this.router.navigateByUrl(this.dashboardMode.defaultLandingPath());
      } catch {
        this.turnstile.reset();
        return undefined;
      }
      return undefined;
    });
  }

  async onRegister(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.registerForm, async (formValue) => {
      const { confirmPassword: _confirmPassword, ...rawPayload } = formValue().value();
      const trimmedOrganizationName = rawPayload.organizationName.trim();
      const payload = {
        ...rawPayload,
        organizationName: trimmedOrganizationName || undefined,
      };
      try {
        const turnstileToken = await this.turnstile.requestToken();
        await firstValueFrom(this.authStore.register(payload, turnstileToken));
        this.turnstile.reset();
      } catch {
        this.turnstile.reset();
        return undefined;
      }

      try {
        await this.router.navigateByUrl(this.dashboardMode.defaultLandingPath());
      } catch {
        return undefined;
      }
      return undefined;
    });
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
