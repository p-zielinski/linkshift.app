import { Injectable } from '@angular/core';
import {
  DOCUMENTATION_MARKDOWN_PAGES,
  DocumentationMarkdownPage,
} from '../generated/documentation.generated';

@Injectable({
  providedIn: 'root',
})
export class DocumentationContentService {
  readonly pages = DOCUMENTATION_MARKDOWN_PAGES;

  readonly guidePages = this.pages.filter((page) => page.category === 'guide');
  readonly conceptPages = this.pages.filter((page) => page.category === 'concept');

  getPageBySlug(slug: string): DocumentationMarkdownPage | null {
    return this.pages.find((page) => page.slug === slug) ?? null;
  }
}
