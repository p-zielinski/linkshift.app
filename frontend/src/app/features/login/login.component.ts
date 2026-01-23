import { Component, inject, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
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

        <button type="submit" [disabled]="loginForm.invalid || isLoading">
          {{ isLoading ? 'Logowanie...' : 'Zaloguj' }}
        </button>

        <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Example of using an effect (reacting to signal changes)
  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        console.log('User is logged in, redirecting...');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        // Redirect handled by effect or manually here
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Nieprawidłowy email lub hasło.';
        this.isLoading = false;
      }
    });
  }
}
