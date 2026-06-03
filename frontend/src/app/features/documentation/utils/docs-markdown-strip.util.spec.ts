import { stripHiddenOnPurposeMarkdown } from './docs-markdown-strip.util';

describe('stripHiddenOnPurposeMarkdown', () => {
  it('removes fenced hidden-on-purpose blocks with optional opening comment', () => {
    const markdown = `Intro.

:::hidden-on-purpose internal plan tiers
**UNMETERED** — not for readers.
:::

Outro.`;

    expect(stripHiddenOnPurposeMarkdown(markdown)).toBe(`Intro.

Outro.`);
  });

  it('removes HTML comment regions', () => {
    const markdown = `Before.
<!-- ::hidden-on-purpose note -->
Secret line.
<!-- ::hidden-on-purpose:end -->
After.`;

    expect(stripHiddenOnPurposeMarkdown(markdown)).toBe(`Before.
After.`);
  });

  it('removes standalone hidden-on-purpose marker comments', () => {
    const markdown = `Visible <!-- ::hidden-on-purpose: author note --> still visible.`;

    expect(stripHiddenOnPurposeMarkdown(markdown)).toBe('Visible  still visible.');
  });
});
