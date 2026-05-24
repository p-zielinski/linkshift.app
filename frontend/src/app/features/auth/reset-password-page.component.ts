import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { form, required, validate, FormField } from '@angular/forms/signals';
import { z } from 'zod';
import { AuthApiService } from '../../core/api/auth-api.service';
import { applyZodField } from '../../core/forms/zod-validators';
import { EMAIL_MAX_LENGTH } from '../../core/forms/validation.constants';
import { firstValueFrom } from 'rxjs';

const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters`);

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    FormField,
    RouterLink,
  ],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css',
})
export class ResetPasswordPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformId = inject(PLATFORM_ID);

  readonly token = signal<string | null>(null);
  readonly hasToken = computed(() => !!this.token());
  readonly busy = signal(false);

  readonly requestModel = signal({ email: '' });
  readonly requestForm = form(this.requestModel, (f) => {
    required(f.email);
    applyZodField(f.email, emailSchema);
  });

  readonly resetModel = signal({ password: '', confirmPassword: '' });
  readonly resetForm = form(this.resetModel, (f) => {
    required(f.password);
    required(f.confirmPassword);
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

  readonly emailError = computed(() => this.getFieldError(this.requestForm.email()));
  readonly passwordError = computed(() => this.getFieldError(this.resetForm.password()));
  readonly confirmError = computed(() => this.getFieldError(this.resetForm.confirmPassword()));

  constructor() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const queryToken = this.route.snapshot.queryParamMap.get('token');
    this.token.set(queryToken);
  }

  async requestReset(): Promise<void> {
    if (!this.requestForm.email().valid()) {
      this.requestForm.email().markAsTouched();
      return;
    }

    this.busy.set(true);
    try {
      const email = this.requestModel().email.trim();
      await firstValueFrom(this.authApi.requestPasswordReset({ email }));
      this.snackBar.open('Check your email for a reset link.', 'Dismiss', {
        duration: 4000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset request failed.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.busy.set(false);
    }
  }

  async confirmReset(): Promise<void> {
    const token = this.token();
    if (!token) {
      return;
    }
    if (!this.resetForm.password().valid() || !this.resetForm.confirmPassword().valid()) {
      this.resetForm.password().markAsTouched();
      this.resetForm.confirmPassword().markAsTouched();
      return;
    }

    this.busy.set(true);
    try {
      const password = this.resetModel().password;
      await firstValueFrom(this.authApi.confirmPasswordReset({ token, password }));
      this.snackBar.open('Password updated. Please log in.', 'Dismiss', {
        duration: 4000,
      });
      await this.router.navigateByUrl('/auth');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed.';
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
