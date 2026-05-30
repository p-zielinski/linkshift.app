import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Docs HTML comes from build-time `shared/docs` via `docs:sync`, not from users.
 * Default Angular sanitization strips `id` on headings, which breaks `#anchor` navigation.
 */
export function toTrustedDocsHtml(sanitizer: DomSanitizer, html: string): SafeHtml {
  return sanitizer.bypassSecurityTrustHtml(html);
}
