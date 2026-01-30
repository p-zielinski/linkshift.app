import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthApiService } from '../../core/api/auth-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './verify-email-page.component.html',
  styleUrl: './verify-email-page.component.css'
})
export class VerifyEmailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);

  readonly verifying = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = computed(() => !this.verifying() && !this.error());

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.verify(token);
  }

  private async verify(token: string): Promise<void> {
    if (!token) {
      this.error.set('Verification token is missing.');
      this.verifying.set(false);
      return;
    }

    try {
      await firstValueFrom(this.authApi.verifyEmail({ token }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed.';
      this.error.set(message);
    } finally {
      this.verifying.set(false);
    }
  }
}
