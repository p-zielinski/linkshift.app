import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QrCodeApiService, QrCodeAssetFormat } from '../../../../core/api/qr-code-api.service';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';

@Component({
  selector: 'app-qr-code-generator-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MarketingSectionComponent,
  ],
  templateUrl: './qr-code-generator-page.component.html',
  styleUrl: './qr-code-generator-page.component.css',
})
export class QrCodeGeneratorPageComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private readonly qrCodeApi = inject(QrCodeApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly sourceUrlControl = new FormControl('https://', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(2048)],
  });

  readonly isGenerating = signal(false);
  readonly generatedSourceUrl = signal<string | null>(null);
  readonly previewObjectUrl = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly hasReadyCode = computed(() => !!this.generatedSourceUrl() && !!this.previewObjectUrl());

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly previewSize = 512;
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | QR Code Generator (PNG, SVG, EPS)`,
      description:
        'Generate a QR code for any URL and export it as PNG, SVG, or EPS. Shareable URL state and secure backend rate limiting included.',
      canonicalPath: '/qr-code-generator',
      keywords:
        'qr code generator, qr code png, qr code svg, qr code eps, dynamic qr code redirects',
      type: 'website',
    });

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

  private async resolveErrorMessage(error: unknown): Promise<string> {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Failed to generate QR code. Please try again later.';
    }

    const details = await this.extractDetails(error.error);
    if (details) {
      return details;
    }

    if (error.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.status === 400) {
      return 'Invalid URL. Use a complete address with http:// or https://.';
    }

    return 'Failed to generate QR code. Please try again later.';
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
