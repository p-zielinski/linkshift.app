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
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { loginSchema, registerSchema } from './auth.schemas';
import {
  BillingInterval,
  OrganizationPlan,
} from '@shared/models/organization-config.model';
import { SITE_CONFIG } from '../../core/config/site-config';
import { BillingPlansStore } from '../../core/store/billing-plans.store';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { formatLimitSummary } from '../../core/utils/plan-limits';
import { BillingPlanPrice } from '../../core/api/billing-api.service';
import { PaddleCheckoutFlowService } from '../../core/billing/paddle-checkout-flow.service';

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
    MatRadioModule,
    MatCheckboxModule,
    MatButtonToggleModule,
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
  readonly siteConfig = inject(SITE_CONFIG);
  private readonly billingPlansStore = inject(BillingPlansStore);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly checkoutFlow = inject(PaddleCheckoutFlowService);

  loginModel = signal({
    email: '',
    password: ''
  });

  registerModel = signal({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: OrganizationPlan.FREE,
    billingInterval: 'MONTHLY' as BillingInterval,
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
    required(f.plan);
    required(f.billingInterval);
    applyZodField(f.organizationName, registerSchema.shape.organizationName);
    applyZodField(f.email, registerSchema.shape.email);
    applyZodField(f.password, registerSchema.shape.password);
    applyZodField(f.plan, registerSchema.shape.plan);
    applyZodField(f.billingInterval, registerSchema.shape.billingInterval);
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

  private readonly pricingByPlan = computed(() => {
    const map = new Map<string, BillingPlanPrice>();
    for (const entry of this.billingPlansStore.plans()) {
      map.set(`${entry.plan}:${entry.interval}`, entry);
    }
    return map;
  });

  readonly plans = computed(() => {
    const interval = this.registerModel().billingInterval ?? 'MONTHLY';
    const limits = this.billingPlansStore.limits();
    const summaryFor = (plan: OrganizationPlan) =>
      limits?.[plan] ? formatLimitSummary(limits[plan]!) : 'Limits loading...';
    return [
      {
        id: OrganizationPlan.FREE,
        title: 'Free',
        price: '0 EUR',
        note: summaryFor(OrganizationPlan.FREE)
      },
      {
        id: OrganizationPlan.BASIC,
        title: 'Basic',
        price: this.formatPlanPrice(OrganizationPlan.BASIC, interval),
        note: summaryFor(OrganizationPlan.BASIC)
      },
      {
        id: OrganizationPlan.PRO,
        title: 'Pro',
        price: this.formatPlanPrice(OrganizationPlan.PRO, interval),
        note: summaryFor(OrganizationPlan.PRO)
      }
    ];
  });

  constructor() {
    if (this.authGateEnabled()) {
      this.registerReady.set(false);
      if (isPlatformBrowser(this.platformId)) {
        const flag = localStorage.getItem('register_ready');
        this.registerReady.set(flag === 'true');
      }
    }

    this.billingPlansStore.loadPlans();

    effect(() => {
      const error = this.authStore.error();
      if (!error) {
        return;
      }
      const message = error.trim() || 'Something went wrong. Please try again.';
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
        await firstValueFrom(this.authStore.login(formValue().value()));
        await this.router.navigateByUrl('/dashboard');
      } catch {
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
        await firstValueFrom(this.authStore.register(payload));
      } catch {
        return undefined;
      }

      if (payload.plan !== OrganizationPlan.FREE) {
        const priceId = this.getPriceId(payload.plan, payload.billingInterval);
        if (!priceId) {
          this.snackBar.open(
            'Missing price mapping for selected plan. You can retry from the dashboard.',
            'Dismiss',
            {
              duration: 6000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['bg-amber-600', 'text-white'],
            },
          );
        } else {
          try {
            const checkoutResult = await this.checkoutFlow.startCheckout({
              priceId,
              plan: payload.plan,
              interval: payload.billingInterval,
              source: 'registration',
            });

            if (checkoutResult.status === 'completed') {
              this.snackBar.open('Payment received. We are confirming plan activation.', 'Dismiss', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['bg-emerald-600', 'text-white'],
              });
            } else {
              this.snackBar.open('Checkout canceled. You can upgrade later from dashboard.', 'Dismiss', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
              });
            }
          } catch (checkoutError) {
            const message =
              checkoutError instanceof Error
                ? checkoutError.message
                : 'Unable to open checkout overlay. You can retry from dashboard.';
            this.snackBar.open(message, 'Dismiss', {
              duration: 6000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['bg-amber-600', 'text-white'],
            });
          }
        }
      }

      try {
        await this.router.navigateByUrl('/dashboard');
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

  private formatPlanPrice(
    plan: OrganizationPlan,
    interval: BillingInterval,
  ): string {
    const pricing = this.getPlanPrice(plan, interval);
    if (!pricing) {
      return 'Contact us';
    }
    const normalized =
      Math.round(pricing.amount) === pricing.amount
        ? pricing.amount.toFixed(0)
        : pricing.amount.toFixed(2);
    const suffix = interval === 'YEARLY' ? 'year' : 'month';
    return `${normalized} ${pricing.currency} / ${suffix}`;
  }

  private getPlanPrice(
    plan: OrganizationPlan,
    interval: BillingInterval,
  ): BillingPlanPrice | null {
    return this.pricingByPlan().get(`${plan}:${interval}`) ?? null;
  }

  private getPriceId(
    plan: OrganizationPlan,
    interval: BillingInterval,
  ): string | null {
    return this.getPlanPrice(plan, interval)?.priceId ?? null;
  }
}
