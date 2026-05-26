import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';
import { toTrustedDocsHtml } from './docs-html-sanitizer.util';

describe('docs HTML sanitizer', () => {
  it('strips heading id attributes from default sanitize', () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const raw =
      '<h2 id="conditional-routing-syntax">Conditional routing syntax</h2>';
    const safe = sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';

    expect(safe).not.toContain('id="conditional-routing-syntax"');
  });

  it('preserves heading ids for trusted docs HTML', () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const raw =
      '<h2 id="conditional-routing-syntax">Conditional routing syntax</h2>';
    const trusted = toTrustedDocsHtml(sanitizer, raw);

    expect(String(trusted)).toContain('id="conditional-routing-syntax"');
  });
});
