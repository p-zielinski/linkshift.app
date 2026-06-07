import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_TRACE_MAX_HOPS,
  RedirectTraceApiService,
  type RedirectTraceHop,
} from '../../../../core/api/redirect-trace-api.service';

type UserAgentPreset = {
  key: string;
  label: string;
  value: string;
};

const USER_AGENT_PRESETS: UserAgentPreset[] = [
  {
    key: 'chrome-desktop',
    label: 'Chrome (Desktop)',
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  },
  {
    key: 'safari-ios',
    label: 'Safari (iPhone)',
    value:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  },
  {
    key: 'googlebot-mobile',
    label: 'Googlebot Mobile',
    value:
      'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  },
];

const CUSTOM_USER_AGENT_KEY = 'custom';
const TRACE_MAX_HOPS = DEFAULT_TRACE_MAX_HOPS;
const TRACE_URL_MAX_LENGTH = 1024 * 16;

@Component({
  selector: 'app-redirect-trace-tester-tool',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './redirect-trace-tester-tool.component.html',
  styleUrl: './redirect-trace-tester-tool.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectTraceTesterToolComponent implements OnInit {
  private readonly redirectTraceApi = inject(RedirectTraceApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly showShareHint = input(true);
  readonly traceCompleted = output<void>();

  readonly sourceUrlControl = new FormControl('http://', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(TRACE_URL_MAX_LENGTH)],
  });

  readonly userAgentPresetControl = new FormControl(USER_AGENT_PRESETS[0]?.key ?? '', {
    nonNullable: true,
  });
  readonly customUserAgentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(256)],
  });

  readonly isTesting = signal(false);
  readonly hops = signal<RedirectTraceHop[]>([]);
  readonly testedUrl = signal<string | null>(null);
  readonly testedUserAgent = signal<string | null>(null);
  readonly finalResolvedUrl = signal<string | null>(null);
  readonly noticeMessage = signal<string | null>(null);
  readonly progressMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedUserAgentKey = signal(USER_AGENT_PRESETS[0]?.key ?? '');
  readonly customUserAgentValue = signal('');

  readonly hasResults = computed(() => this.hops().length > 0);
  readonly userAgentOptions = [
    ...USER_AGENT_PRESETS.map((preset) => ({ key: preset.key, label: preset.label })),
    { key: CUSTOM_USER_AGENT_KEY, label: 'Custom User-Agent' },
  ];
  readonly isCustomUserAgent = computed(
    () => this.selectedUserAgentKey() === CUSTOM_USER_AGENT_KEY,
  );
  readonly selectedUserAgentPreview = computed(() => {
    if (this.selectedUserAgentKey() === CUSTOM_USER_AGENT_KEY) {
      return this.customUserAgentValue().trim();
    }

    const preset = USER_AGENT_PRESETS.find((item) => item.key === this.selectedUserAgentKey());
    return preset?.value ?? '';
  });
  readonly finalDestination = computed(() => this.finalResolvedUrl());
  readonly hopViews = computed(() =>
    this.hops().map((hop) => ({
      hop,
      statusTone: resolveHopStatusTone(hop.status),
      statusDescription: resolveHopStatusDescription(hop),
      headerEntries: resolveHopHeaderEntries(hop.headers),
    })),
  );

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((query) => {
      const source = query.get('url');
      if (!source) {
        return;
      }

      const queryUserAgent = query.get('ua');
      this.applyUserAgentFromQuery(queryUserAgent);
      this.sourceUrlControl.setValue(source);
    });

    this.userAgentPresetControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.selectedUserAgentKey.set(value);
      });

    this.customUserAgentControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.customUserAgentValue.set(value);
      });
  }

  async onTestClick(): Promise<void> {
    await this.trace(this.sourceUrlControl.value, true);
  }

  private async trace(source: string, syncQuery: boolean): Promise<void> {
    if (this.isTesting()) {
      return;
    }

    const normalized = this.normalizeAndValidateUrl(source);
    if (!normalized) {
      this.errorMessage.set(
        'Enter a valid URL or domain. Example: example.com/about or https://example.com/about.',
      );
      this.hops.set([]);
      this.testedUrl.set(null);
      this.testedUserAgent.set(null);
      this.finalResolvedUrl.set(null);
      this.noticeMessage.set(null);
      this.progressMessage.set(null);
      return;
    }

    const userAgent = this.resolveSelectedUserAgent();
    this.sourceUrlControl.setValue(normalized);
    this.isTesting.set(true);
    this.errorMessage.set(null);
    this.noticeMessage.set(null);
    this.progressMessage.set('Starting redirect trace...');
    this.hops.set([]);
    this.testedUrl.set(normalized);
    this.testedUserAgent.set(userAgent);
    this.finalResolvedUrl.set(null);

    try {
      const visitedUrls = new Set<string>();
      let currentUrl = normalized;
      let loopDetected = false;
      let loopUrl: string | null = null;

      for (let index = 0; index < TRACE_MAX_HOPS; index += 1) {
        if (visitedUrls.has(currentUrl)) {
          loopDetected = true;
          loopUrl = currentUrl;
          break;
        }

        visitedUrls.add(currentUrl);
        this.progressMessage.set(
          `In progress: checked ${index} of ${TRACE_MAX_HOPS} hops. Fetching hop ${index + 1}...`,
        );

        const step = await firstValueFrom(this.redirectTraceApi.traceStep(currentUrl, userAgent));
        const hop: RedirectTraceHop = {
          ...step,
          hop: index + 1,
        };

        this.hops.update((currentHops) => [...currentHops, hop]);

        if (step.error || !step.isRedirect || !step.destination) {
          break;
        }

        currentUrl = step.destination;
      }

      const currentHops = this.hops();
      const lastHop = currentHops[currentHops.length - 1] ?? null;
      const stoppedByMaxHops =
        !loopDetected &&
        currentHops.length === TRACE_MAX_HOPS &&
        !!lastHop &&
        !lastHop.error &&
        lastHop.isRedirect &&
        !!lastHop.destination;

      if (loopDetected) {
        const repeatedUrl = loopUrl ?? 'unknown';
        this.noticeMessage.set(
          `Detected a redirect loop. URL ${repeatedUrl} was requested more than once, so the chain has no stable resolution.`,
        );
        this.finalResolvedUrl.set(null);
      } else if (stoppedByMaxHops) {
        this.noticeMessage.set(
          `Stopped after ${TRACE_MAX_HOPS} hops. Increase the frontend hop limit if you need deeper inspection.`,
        );
        this.finalResolvedUrl.set(null);
      } else if (lastHop && !lastHop.error) {
        this.finalResolvedUrl.set(lastHop.isRedirect ? (lastHop.destination ?? null) : lastHop.url);
      } else {
        this.finalResolvedUrl.set(null);
      }

      if (syncQuery) {
        await this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            url: normalized,
            ua: null,
          },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }

      this.traceCompleted.emit();
    } catch (error) {
      this.hops.set([]);
      this.testedUrl.set(null);
      this.testedUserAgent.set(null);
      this.finalResolvedUrl.set(null);
      this.noticeMessage.set(null);
      this.progressMessage.set(null);
      this.errorMessage.set(await this.resolveErrorMessage(error));
    } finally {
      this.progressMessage.set(null);
      this.isTesting.set(false);
    }
  }

  private resolveSelectedUserAgent(): string {
    const selectedKey = this.selectedUserAgentKey();

    if (selectedKey === CUSTOM_USER_AGENT_KEY) {
      const custom = this.customUserAgentValue().trim();
      return custom || USER_AGENT_PRESETS[0].value;
    }

    const preset = USER_AGENT_PRESETS.find((item) => item.key === selectedKey);
    return preset?.value ?? USER_AGENT_PRESETS[0].value;
  }

  private applyUserAgentFromQuery(value: string | null): void {
    if (!value) {
      return;
    }

    const matched = USER_AGENT_PRESETS.find((item) => item.value === value);
    if (matched) {
      this.userAgentPresetControl.setValue(matched.key);
      this.customUserAgentControl.setValue('');
      this.selectedUserAgentKey.set(matched.key);
      this.customUserAgentValue.set('');
      return;
    }

    this.userAgentPresetControl.setValue(CUSTOM_USER_AGENT_KEY);
    this.customUserAgentControl.setValue(value);
    this.selectedUserAgentKey.set(CUSTOM_USER_AGENT_KEY);
    this.customUserAgentValue.set(value);
  }

  private normalizeAndValidateUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

    try {
      const parsed = new URL(withProtocol);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }

  private async resolveErrorMessage(error: unknown): Promise<string> {
    if (!(error instanceof HttpErrorResponse)) {
      return "Couldn't trace redirect. Try again in a moment.";
    }

    const details = await this.extractDetails(error.error);
    if (details) {
      return details;
    }

    if (error.status === 429) {
      return 'Too many requests. Wait a moment and try again.';
    }

    if (error.status === 400) {
      return 'Invalid URL. Use a complete URL or domain, e.g. https://linkshift.app.';
    }

    return "Couldn't trace redirect. Try again in a moment.";
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

type HopStatusTone = 'redirect' | 'success' | 'error' | 'neutral';

function resolveHopStatusTone(status: number | null): HopStatusTone {
  if (status === null) {
    return 'neutral';
  }
  if ([301, 302, 303, 307, 308].includes(status)) {
    return 'redirect';
  }
  if (status >= 200 && status < 300) {
    return 'success';
  }
  if (status >= 400) {
    return 'error';
  }
  return 'neutral';
}

function resolveHopStatusDescription(hop: RedirectTraceHop): string {
  if (hop.error) {
    return `This step didn't complete: ${hop.error}.`;
  }

  if (hop.status === null) {
    return 'No HTTP response status was returned for this step.';
  }

  if (hop.isRedirect && hop.destination) {
    return `This URL returned ${hop.status} and redirected to the Location header target.`;
  }

  if (hop.status >= 200 && hop.status < 300) {
    return 'This URL returned a 2xx response with no further redirect.';
  }

  if (hop.status >= 400 && hop.status < 500) {
    return 'This URL returned a client error response.';
  }

  if (hop.status >= 500) {
    return 'This URL returned a server error response.';
  }

  return 'This URL returned a non-redirect response.';
}

function resolveHopHeaderEntries(
  headers: Record<string, string>,
): Array<{ key: string; value: string }> {
  return Object.entries(headers)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
