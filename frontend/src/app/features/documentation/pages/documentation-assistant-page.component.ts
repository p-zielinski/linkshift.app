import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DocsAssistantComponent } from '../components/docs-assistant/docs-assistant.component';

@Component({
  selector: 'app-documentation-assistant-page',
  standalone: true,
  imports: [DocsAssistantComponent],
  template: `
    <section class="grid min-w-0 gap-4">
      <app-docs-assistant [pageContext]="pageContext()" />
    </section>
  `,
})
export class DocumentationAssistantPageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly pageContext = signal<string | null>(null);

  constructor() {
    this.title.setTitle('Ask docs | LinkShift documentation');
    this.meta.updateTag({
      name: 'description',
      content: 'Ask questions about LinkShift documentation, redirects, link maps, and the API',
    });
  }

  ngOnInit(): void {
    const navigationContext = this.router.getCurrentNavigation()?.extras?.state?.['pageContext'];
    if (typeof navigationContext === 'string' && navigationContext.trim()) {
      this.pageContext.set(navigationContext.trim());
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const historyContext = history.state?.['pageContext'];
    if (typeof historyContext === 'string' && historyContext.trim()) {
      this.pageContext.set(historyContext.trim());
    }
  }
}
