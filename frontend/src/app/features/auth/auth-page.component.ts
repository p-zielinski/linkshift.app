import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { loginSchema, registerSchema } from './auth.schemas';
import { OrganizationPlan } from '@shared/models/organization-config.model';

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
    FormField,
    RouterLink
  ],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  readonly authStore = inject(AuthStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  loginModel = signal({
    email: '',
    password: ''
  });

  registerModel = signal({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: OrganizationPlan.FREE
  });

  loginForm = form(this.loginModel, (f) => {
    required(f.email);
    required(f.password);
    applyZodField(f.email, loginSchema.shape.email);
    applyZodField(f.password, loginSchema.shape.password);
  });

  registerForm = form(this.registerModel, (f) => {
    required(f.organizationName);
    required(f.email);
    required(f.password);
    required(f.confirmPassword);
    required(f.plan);
    applyZodField(f.organizationName, registerSchema.shape.organizationName);
    applyZodField(f.email, registerSchema.shape.email);
    applyZodField(f.password, registerSchema.shape.password);
    applyZodField(f.plan, registerSchema.shape.plan);

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

  readonly plans = [
    {
      id: OrganizationPlan.FREE,
      title: 'Free',
      price: '0 EUR',
      note: '1 domain group • 1 domain • 15 rules • 1 seat • 10 redirects/min'
    },
    {
      id: OrganizationPlan.STARTER,
      title: 'Starter',
      price: '10 EUR',
      note: '1 domain group • 10 domains • 250 rules • 3 seats • 50 redirects/min'
    },
    {
      id: OrganizationPlan.PRO,
      title: 'Pro',
      price: '29 EUR',
      note: '2 domain groups • 15 domains • 500 rules • 5 seats • 100 redirects/min'
    }
  ];

  constructor() {
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
      try {
        const { confirmPassword: _confirmPassword, ...payload } = formValue().value();
        const response = await firstValueFrom(this.authStore.register(payload));
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
          return undefined;
        }
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
}
