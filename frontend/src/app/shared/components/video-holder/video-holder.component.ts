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

@Component({
  selector: 'app-video-holder',
  standalone: true,
  templateUrl: './video-holder.component.html',
  styleUrl: './video-holder.component.css',
})
export class VideoHolderComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private player: any = null;

  @ViewChild('videoElement') private videoElement?: ElementRef<HTMLVideoElement>;

  readonly src = input.required<string>();
  readonly type = input('video/mp4');
  readonly ratio = input<'16:9' | '9:16'>('16:9');
  readonly preload = input<'none' | 'metadata' | 'auto'>('auto');
  readonly posterSrc = input<string | null>(null);

  readonly isReady = signal(false);

  readonly videoWidth = computed(() => (this.ratio() === '9:16' ? 720 : 1280));
  readonly videoHeight = computed(() => (this.ratio() === '9:16' ? 1280 : 720));

  ngAfterViewInit(): void {
    if (!this.isBrowser || !this.videoElement?.nativeElement) return;

    // HACK: Micro-delay for Firefox routing stability
    setTimeout(async () => {
      const element = this.videoElement!.nativeElement;

      try {
        const plyrModule = await import('plyr');
        const Plyr = ('default' in plyrModule ? plyrModule.default : plyrModule) as any;

        // Force a fresh load before Plyr takes over
        element.load();

        this.player = new Plyr(element, {
          controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
          settings: ['speed'],
          speed: { selected: 1, options: [0.75, 1, 1.25, 1.5] },
          iconUrl: '/plyr.svg',
        });

        // Event listeners for ready state
        element.onloadeddata = () => this.isReady.set(true);

        // Final fallback for Firefox: if it's already got enough data
        if (element.readyState >= 3) {
          this.isReady.set(true);
        }
      } catch (e) {
        console.error('Video Init Error:', e);
      }
    }, 50);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    if (this.videoElement?.nativeElement) {
      const video = this.videoElement.nativeElement;

      // THE FIREFOX HACK: Hard reset the video engine
      video.pause();
      video.src = ''; // Clear the source
      video.load(); // Force the browser to unload the buffer
      video.remove(); // Remove from DOM to be sure
    }
  }
}
