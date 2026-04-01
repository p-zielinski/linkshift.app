import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  input,
} from '@angular/core';

type VideoPlayer = { destroy: () => void };

type VideoHolderOptions = {
  controls: string[];
  settings: string[];
  speed: { selected: number; options: number[] };
  iconUrl: string;
};

type PlyrCtor = new (target: HTMLVideoElement, options?: VideoHolderOptions) => VideoPlayer;

const DEFAULT_PLYR_OPTIONS: VideoHolderOptions = {
  controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
  settings: ['speed'],
  speed: { selected: 1, options: [0.75, 1, 1.25, 1.5] },
  iconUrl: '/plyr.svg',
};

@Component({
  selector: 'app-video-holder',
  standalone: true,
  templateUrl: './video-holder.component.html',
  styleUrl: './video-holder.component.css',
})
export class VideoHolderComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private player: VideoPlayer | null = null;
  private readyCheckIntervalId: ReturnType<typeof setInterval> | null = null;
  private hasFrameData = false;
  private isPlyrInitialized = false;

  readonly src = input.required<string>();
  readonly type = input('video/mp4');
  readonly ratio = input<'16:9' | '9:16'>('16:9');
  readonly preload = input<'none' | 'metadata' | 'auto'>('auto');
  readonly posterSrc = input<string | null>(null);
  readonly posterAlt = input('Video poster');
  readonly playerOptions = input<VideoHolderOptions>(DEFAULT_PLYR_OPTIONS);

  readonly videoWidth = computed(() => (this.ratio() === '9:16' ? 720 : 1280));
  readonly videoHeight = computed(() => (this.ratio() === '9:16' ? 1280 : 720));

  videoReady = false;

  @ViewChild('videoElement', { static: false })
  private videoElement?: ElementRef<HTMLVideoElement>;

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser || !this.videoElement?.nativeElement) {
      return;
    }

    const element = this.videoElement.nativeElement;
    if (element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.hasFrameData = true;
    }

    const plyrModule = await import('plyr');
    const PlyrConstructor = ('default' in plyrModule
      ? plyrModule.default
      : plyrModule) as unknown as PlyrCtor;
    this.player = new PlyrConstructor(element, this.playerOptions());
    this.isPlyrInitialized = true;
    this.updateVideoReadyState();

    // Wait for decoded frame data to avoid flashing a black frame before playback is renderable.
    if (!this.hasFrameData) {
      this.readyCheckIntervalId = setInterval(() => {
        if (element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          this.onVideoReady();
        }
      }, 200);
    }
  }

  onVideoReady(): void {
    this.hasFrameData = true;
    this.updateVideoReadyState();
  }

  private updateVideoReadyState(): void {
    const shouldBeReady = this.isPlyrInitialized && this.hasFrameData;
    if (shouldBeReady === this.videoReady) {
      return;
    }

    this.videoReady = shouldBeReady;
    if (shouldBeReady && this.readyCheckIntervalId) {
      clearInterval(this.readyCheckIntervalId);
      this.readyCheckIntervalId = null;
    }
  }

  ngOnDestroy(): void {
    if (this.readyCheckIntervalId) {
      clearInterval(this.readyCheckIntervalId);
      this.readyCheckIntervalId = null;
    }
    this.player?.destroy();
    this.player = null;
  }
}
