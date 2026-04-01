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
  signal,
} from '@angular/core';

type VideoPlayer = { destroy: () => void };

type VideoOptions = {
  controls: string[];
  settings: string[];
  speed: { selected: number; options: number[] };
  iconUrl: string;
};

const DEFAULT_OPTIONS: VideoOptions = {
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

  @ViewChild('videoElement') private videoElement?: ElementRef<HTMLVideoElement>;

  readonly src = input.required<string>();
  readonly type = input('video/mp4');
  readonly ratio = input<'16:9' | '9:16'>('16:9');
  readonly preload = input<'none' | 'metadata' | 'auto'>('auto');
  readonly posterSrc = input<string | null>(null);
  readonly playerOptions = input<VideoOptions>(DEFAULT_OPTIONS);

  readonly isReady = signal(false);

  readonly videoWidth = computed(() => (this.ratio() === '9:16' ? 720 : 1280));
  readonly videoHeight = computed(() => (this.ratio() === '9:16' ? 1280 : 720));

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser || !this.videoElement?.nativeElement) return;

    const element = this.videoElement.nativeElement;

    // Initialize Plyr
    const plyrModule = await import('plyr');
    const Plyr = ('default' in plyrModule ? plyrModule.default : plyrModule) as any;
    this.player = new Plyr(element, this.playerOptions());

    // If video is already loaded (from cache), trigger ready state
    if (element.readyState >= 2) {
      this.onVideoReady();
    }
  }

  onVideoReady(): void {
    this.isReady.set(true);
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
    }
  }
}
