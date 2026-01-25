import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  customError,
  form,
  required,
  submit,
  validate
} from '@angular/forms/signals';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { loginSchema, registerSchema } from './auth.schemas';

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
    MatIconModule
  ],
  template: `
    <div class="auth-shell">
      <mat-card class="auth-card">
        <div class="auth-title">
          <div>
            <h1>Access Control</h1>
            <p class="subtle">Authenticate to manage domains and redirect rules.</p>
          </div>
          <div class="chip-muted">
            <mat-icon>security</mat-icon>
            <span>Secure session</span>
          </div>
        </div>

        <mat-tab-group>
          <mat-tab label="Login">
            <form class="form-grid" (ngSubmit)="onLogin()">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" [field]="loginForm.email" />
                <mat-error *ngIf="loginEmailError() as error">{{ error }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" [field]="loginForm.password" />
                <mat-error *ngIf="loginPasswordError() as error">{{ error }}</mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="loginForm().submitting()"
                >
                  <mat-icon>login</mat-icon>
                  <span>Sign in</span>
                </button>
              </div>

              <div class="subtle" *ngIf="authStore.error()">
                {{ authStore.error() }}
              </div>
            </form>
          </mat-tab>

          <mat-tab label="Register">
            <form class="form-grid" (ngSubmit)="onRegister()">
              <mat-form-field appearance="outline">
                <mat-label>Organization name</mat-label>
                <input matInput type="text" [field]="registerForm.organizationName" />
                <mat-error *ngIf="registerOrgError() as error">{{ error }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" [field]="registerForm.email" />
                <mat-error *ngIf="registerEmailError() as error">{{ error }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" [field]="registerForm.password" />
                <mat-error *ngIf="registerPasswordError() as error">{{ error }}</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Confirm password</mat-label>
                <input matInput type="password" [field]="registerForm.confirmPassword" />
                <mat-error *ngIf="registerConfirmError() as error">{{ error }}</mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="registerForm().submitting()"
                >
                  <mat-icon>person_add</mat-icon>
                  <span>Create account</span>
                </button>
              </div>

              <div class="subtle" *ngIf="authStore.error()">
                {{ authStore.error() }}
              </div>
            </form>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
      }

      .auth-card {
        width: min(520px, 96vw);
        padding: 28px;
        border-radius: 24px;
        background: var(--app-surface);
        box-shadow: 0 30px 60px rgba(32, 24, 28, 0.18);
      }

      .auth-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      h1 {
        margin: 0 0 6px;
        font-size: 28px;
      }
    `
  ]
})
export class AuthPageComponent {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  loginModel = signal({
    email: '',
    password: ''
  });

  registerModel = signal({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    applyZodField(f.organizationName, registerSchema.shape.organizationName);
    applyZodField(f.email, registerSchema.shape.email);
    applyZodField(f.password, registerSchema.shape.password);

    validate(f.confirmPassword, ({ value, valueOf }) => {
      if (!value()) {
        return customError({ kind: 'required', message: 'Confirm password is required' });
      }
      if (value() !== valueOf(f.password)) {
        return customError({ kind: 'password-mismatch', message: 'Passwords must match' });
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

  async onLogin(): Promise<void> {
    await submit(this.loginForm, async (formValue) => {
      try {
        await firstValueFrom(this.authStore.login(formValue.value()));
        await this.router.navigateByUrl('/dashboard');
      } catch {
        return undefined;
      }
      return undefined;
    });
  }

  async onRegister(): Promise<void> {
    await submit(this.registerForm, async (formValue) => {
      try {
        const { confirmPassword: _confirmPassword, ...payload } = formValue.value();
        await firstValueFrom(this.authStore.register(payload));
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
