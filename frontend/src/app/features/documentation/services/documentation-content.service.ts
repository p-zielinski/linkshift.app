import { Injectable } from '@angular/core';
import {
  DOCUMENTATION_MARKDOWN_PAGES,
  DocumentationMarkdownPage,
  DocumentationPageCategory,
} from '../generated/documentation.generated';
import {
  buildDocumentationSidebarNavGroups,
  DocumentationSidebarNavGroup,
} from '../utils/documentation-sidebar-groups.util';

@Injectable({
  providedIn: 'root',
})
export class DocumentationContentService {
  readonly pages = DOCUMENTATION_MARKDOWN_PAGES;

  readonly metaPages = this.pagesByCategory('meta');
  readonly introPages = this.pagesByCategory('intro');
  readonly guidePages = this.pagesByCategory('guide');
  readonly conceptPages = this.pagesByCategory('concept');
  readonly sidebarNavGroups: DocumentationSidebarNavGroup[] =
    buildDocumentationSidebarNavGroups(this.pages);

  getPageBySlug(slug: string): DocumentationMarkdownPage | null {
    return this.pages.find((page) => page.slug === slug) ?? null;
  }

  private pagesByCategory(
    category: DocumentationPageCategory,
  ): DocumentationMarkdownPage[] {
    return this.pages.filter((page) => page.category === category);
  }
}
