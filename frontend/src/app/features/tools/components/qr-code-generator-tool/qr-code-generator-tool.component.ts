import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_TRACE_MAX_HOPS,
  RedirectTraceApiService,
} from '../../../../core/api/redirect-trace-api.service';
import { QrCodeApiService, QrCodeAssetFormat } from '../../../../core/api/qr-code-api.service';

@Component({
  selector: 'app-qr-code-generator-tool',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './qr-code-generator-tool.component.html',
  styleUrl: './qr-code-generator-tool.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeGeneratorToolComponent implements OnInit, OnDestroy {
  private readonly qrCodeApi = inject(QrCodeApiService);
  private readonly redirectTraceApi = inject(RedirectTraceApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly showShareHint = input(true);

  readonly sourceUrlControl = new FormControl('https://', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(16384)],
  });

  readonly isGenerating = signal(false);
  readonly generatedSourceUrl = signal<string | null>(null);
  readonly previewObjectUrl = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly resolvedDestinationUrl = signal<string | null>(null);
  readonly traceWarning = signal<string | null>(null);

  readonly hasReadyCode = computed(() => !!this.generatedSourceUrl() && !!this.previewObjectUrl());

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly previewSize = 512;
  private readonly traceMaxHops = DEFAULT_TRACE_MAX_HOPS;
  private readonly destroyRef = inject(DestroyRef);
  private traceRunId = 0;

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((query) => {
      const source = query.get('url');
      if (!source) {
        return;
      }

      this.sourceUrlControl.setValue(source);
      if (source === this.generatedSourceUrl()) {
        return;
      }

      void this.generate(source, false);
    });
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  async onGenerateClick(): Promise<void> {
    const value = this.sourceUrlControl.value.trim();
    await this.generate(value, true);
  }

  async onDownloadClick(format: QrCodeAssetFormat): Promise<void> {
    if (!this.hasReadyCode()) {
      this.errorMessage.set('Generate a QR code first.');
      return;
    }

    const source = this.generatedSourceUrl();
    if (!source) {
      this.errorMessage.set('Missing source URL. Try generating again.');
      return;
    }

    this.errorMessage.set(null);

    try {
      const blob = await firstValueFrom(this.qrCodeApi.generate(source, format, this.previewSize));
      this.downloadBlob(blob, format);
    } catch (error) {
      this.errorMessage.set(await this.resolveErrorMessage(error));
    }
  }

  private async generate(source: string, syncQuery: boolean): Promise<void> {
    if (this.isGenerating()) {
      return;
    }

    const validated = this.normalizeAndValidateUrl(source);
    if (!validated) {
      this.generatedSourceUrl.set(null);
      this.revokePreviewUrl();
      this.resolvedDestinationUrl.set(null);
      this.traceWarning.set(null);
      this.errorMessage.set(
        'Enter a valid URL with http:// or https://, for example https://linkshift.app.',
      );
      return;
    }

    this.sourceUrlControl.setValue(validated);
    this.isGenerating.set(true);
    this.errorMessage.set(null);

    try {
      const blob = await firstValueFrom(
        this.qrCodeApi.generate(validated, 'svg', this.previewSize),
      );

      this.setPreviewBlob(blob);
      this.generatedSourceUrl.set(validated);
      this.resolvedDestinationUrl.set(null);
      this.traceWarning.set(null);

      const traceRunId = ++this.traceRunId;
      void this.traceResolvedDestination(validated, traceRunId);

      if (syncQuery) {
        await this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { url: validated },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    } catch (error) {
      this.generatedSourceUrl.set(null);
      this.revokePreviewUrl();
      this.resolvedDestinationUrl.set(null);
      this.traceWarning.set(null);
      this.errorMessage.set(await this.resolveErrorMessage(error));
    } finally {
      this.isGenerating.set(false);
    }
  }

  private normalizeAndValidateUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }

  private setPreviewBlob(blob: Blob): void {
    this.revokePreviewUrl();
    const objectUrl = URL.createObjectURL(blob);
    this.previewObjectUrl.set(objectUrl);
  }

  private revokePreviewUrl(): void {
    const current = this.previewObjectUrl();
    if (!current) {
      return;
    }

    URL.revokeObjectURL(current);
    this.previewObjectUrl.set(null);
  }

  private downloadBlob(blob: Blob, format: QrCodeAssetFormat): void {
    const fileUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = `linkshift-qr-code.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(fileUrl);
  }

  private async traceResolvedDestination(source: string, runId: number): Promise<void> {
    try {
      const result = await this.redirectTraceApi.traceChain(source, undefined, this.traceMaxHops);
      if (runId !== this.traceRunId) {
        return;
      }

      this.resolvedDestinationUrl.set(result.finalUrl);
      if (result.loopDetected) {
        this.traceWarning.set(
          'Redirect destination check detected a loop. This URL does not resolve to a stable final destination.',
        );
        return;
      }

      if (result.stoppedByMaxHops) {
        this.traceWarning.set(`Redirect destination check stopped after ${this.traceMaxHops} hops.`);
        return;
      }

      this.traceWarning.set(null);
    } catch (error) {
      if (runId !== this.traceRunId) {
        return;
      }
      this.resolvedDestinationUrl.set(null);
      this.traceWarning.set(await this.resolveTraceWarning(error));
    }
  }

  private async resolveTraceWarning(error: unknown): Promise<string> {
    if (!(error instanceof HttpErrorResponse)) {
      return "Couldn't verify destination. QR code is still generated.";
    }

    const details = await this.extractDetails(error.error);
    if (details) {
      return `Couldn't verify destination: ${details}`;
    }

    if (error.status === 429) {
      return 'Redirect destination check rate-limited. QR code is still generated.';
    }

    return "Couldn't verify destination. QR code is still generated.";
  }

  private async resolveErrorMessage(error: unknown): Promise<string> {
    if (!(error instanceof HttpErrorResponse)) {
      return "Couldn't generate QR code. Try again in a moment.";
    }

    const details = await this.extractDetails(error.error);
    if (details) {
      return details;
    }

    if (error.status === 429) {
      return 'Too many requests. Wait a moment and try again.';
    }
    if (error.status === 400) {
      return 'Invalid URL. Use a complete address with http:// or https://.';
    }

    return "Couldn't generate QR code. Try again in a moment.";
  }

  private async extractDetails(payload: unknown): Promise<string | null> {
    if (!payload) {
      return null;
    }

    if (typeof payload === 'object' && payload && 'details' in payload) {
      const details = (payload as { details?: unknown }).details;
      return typeof details === 'string' ? details : null;
    }

    if (payload instanceof Blob) {
      try {
        const parsed = JSON.parse(await payload.text()) as { details?: unknown };
        return typeof parsed.details === 'string' ? parsed.details : null;
      } catch {
        return null;
      }
    }

    return null;
  }
}
