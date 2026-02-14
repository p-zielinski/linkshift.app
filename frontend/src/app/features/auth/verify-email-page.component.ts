import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthApiService } from '../../core/api/auth-api.service';
import { catchError, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private inFlight = false;

  readonly verifying = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = computed(() => !this.verifying() && !this.error());

  constructor() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.route.queryParamMap
      .pipe(
        map((params) => params.get('token') ?? ''),
        distinctUntilChanged(),
        switchMap((token) => {
          if (!token) {
            this.error.set('Verification token is missing.');
            this.verifying.set(false);
            return of(null);
          }

          if (this.inFlight) {
            return of(null);
          }

          this.inFlight = true;
          this.error.set(null);
          this.verifying.set(true);

          return this.authApi.verifyEmail({ token }).pipe(
            catchError((error) => {
              const message =
                error instanceof Error ? error.message : 'Verification failed.';
              this.error.set(message);
              return of(null);
            }),
            finalize(() => {
              this.inFlight = false;
              this.verifying.set(false);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
