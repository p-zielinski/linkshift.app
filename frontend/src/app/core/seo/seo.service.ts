import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export type SeoConfig = {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  image?: string;
  type?: string;
};

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  updateTags(config: SeoConfig): void {
    const { title, description, canonicalPath, keywords, image, type } = config;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });

    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    }

    const canonicalUrl = canonicalPath
      ? this.resolveUrl(canonicalPath)
      : this.document.location?.href;

    if (canonicalUrl) {
      this.setCanonical(canonicalUrl);
    }

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: type || 'website' });

    if (canonicalUrl) {
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    }

    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }

    this.meta.updateTag({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    if (image) {
      this.meta.updateTag({ name: 'twitter:image', content: image });
    }
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private resolveUrl(path: string): string {
    const origin = this.document.location?.origin ?? '';
    if (!path.startsWith('/')) {
      return `${origin}/${path}`;
    }
    return `${origin}${path}`;
  }
}
