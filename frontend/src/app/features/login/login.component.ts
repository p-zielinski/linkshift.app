import { Component, inject, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <h2>Zaloguj się</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <input formControlName="email" type="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Hasło" />

        <button type="submit" [disabled]="loginForm.invalid || authStore.isLoading()">
          {{ authStore.isLoading() ? 'Logowanie...' : 'Zaloguj' }}
        </button>

        <p *ngIf="authStore.error()" class="error">{{ authStore.error() }}</p>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Example of using an effect (reacting to signal changes)
  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        console.log('User is logged in, redirecting...');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.getRawValue();

    this.authStore.login({ email: email!, password: password! }).subscribe({
      next: () => {
        // Redirect handled by effect or manually here
      },
      error: () => {
        // Store handles error state
      }
    });
  }
}
