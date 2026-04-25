import {
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const API_KEY_KEY = 'linkshift.docs.tryMe.apiKey';

@Injectable({
  providedIn: 'root',
})
export class DocumentationTryMeSessionService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly apiKey = signal('');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.apiKey.set(sessionStorage.getItem(API_KEY_KEY) ?? '');
  }

  setApiKey(value: string): void {
    this.apiKey.set(value);
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      sessionStorage.setItem(API_KEY_KEY, value);
    } catch {
      // Ignore storage exceptions
    }
  }
}
