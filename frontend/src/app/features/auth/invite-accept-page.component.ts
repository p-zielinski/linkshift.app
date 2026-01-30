import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { form, required, validate, FormField } from '@angular/forms/signals';
import { AuthApiService } from '../../core/api/auth-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-invite-accept-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormField,
    RouterLink
  ],
  templateUrl: './invite-accept-page.component.html',
  styleUrl: './invite-accept-page.component.css'
})
export class InviteAcceptPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly token = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly inviteEmail = signal('');
  readonly organizationName = signal('');
  readonly completed = signal(false);

  readonly formModel = signal({
    password: '',
    confirmPassword: ''
  });

  readonly form = form(this.formModel, (f) => {
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

  readonly passwordError = computed(() => this.getFieldError(this.form.password()));
  readonly confirmError = computed(() => this.getFieldError(this.form.confirmPassword()));

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.token.set(token);
    this.loadInvite(token);
  }

  async registerFromInvite(): Promise<void> {
    const token = this.token();
    if (!token || !this.inviteEmail()) {
      return;
    }

    if (!this.form.password().valid() || !this.form.confirmPassword().valid()) {
      this.form.password().markAsTouched();
      this.form.confirmPassword().markAsTouched();
      return;
    }

    try {
      await firstValueFrom(
        this.authApi.registerInvite({
          token,
          email: this.inviteEmail(),
          password: this.formModel().password
        })
      );
      this.completed.set(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    }
  }

  private async loadInvite(token: string | null): Promise<void> {
    if (!token) {
      this.error.set('Invite token is missing.');
      this.loading.set(false);
      return;
    }

    try {
      const invite = await firstValueFrom(this.authApi.lookupInvite(token));
      this.inviteEmail.set(invite.email);
      this.organizationName.set(invite.organizationName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invite link is invalid or expired.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
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
