import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>
    <div [innerHTML]="jsonLdSafeHtml"></div>
  `,
  styleUrl: './app.css',
})
export class App implements OnInit {
  public jsonLdSafeHtml?: SafeHtml;
  private readonly baseUrl = 'https://linkshift.app/';

  constructor(
    @Inject(DOCUMENT) private dom: Document,
    private meta: Meta,
    private title: Title,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.updateMetadata();
    this.setCanonicalUrl(this.baseUrl);
    this.generateJsonLd();
  }

  /**
   * Updates Meta Tags to fix "Meta Description Length" issues.
   * Target length: ~140-155 characters for optimal SEO.
   */
  private updateMetadata(): void {
    this.title.setTitle('LinkShift.app | Structured Redirect Management & Domain Routing');

    this.meta.updateTag({
      name: 'description',
      content:
        'LinkShift.app: Manage complex redirects with domain groups, regex rules, and conditional logic. Centralized routing for production and staging environments.',
    });

    // Social Media / Open Graph Tags
    this.meta.updateTag({ property: 'og:title', content: 'LinkShift.app - Structured Redirects' });
    this.meta.updateTag({ property: 'og:url', content: this.baseUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  /**
   * Fixes: "Incorrect Canonical URL".
   * Ensures the search engine knows the primary version of this page.
   */
  private setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.dom.querySelector("link[rel='canonical']");

    if (!link) {
      link = this.dom.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.dom.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Fixes: "Missing JSON-LD Schema".
   * Injects structured data to help LLMs and Search Engines understand the product.
   */
  private generateJsonLd(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'LinkShift',
      url: this.baseUrl,
      description:
        'Structured redirect management for domain-group routing with regex and conditional logic.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '0',
        highPrice: '29',
        offerCount: '3',
      },
      browserRequirements: 'Requires JavaScript',
      softwareHelp: 'https://linkshift.app/contact',
    };

    const jsonString = JSON.stringify(schema);

    // bypassSecurityTrustHtml is safe here because the input is a hardcoded object
    this.jsonLdSafeHtml = this.sanitizer.bypassSecurityTrustHtml(
      `<script type="application/ld+json">${jsonString}</script>`,
    );
  }
}
