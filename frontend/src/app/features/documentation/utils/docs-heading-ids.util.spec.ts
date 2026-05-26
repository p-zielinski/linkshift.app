import { ensureDocsHeadingIds } from './docs-heading-ids.util';

describe('ensureDocsHeadingIds', () => {
  it('assigns GitHub-style ids to headings without id', () => {
    const host = document.createElement('article');
    host.innerHTML = '<h2>Conditional routing syntax</h2>';

    ensureDocsHeadingIds(host);

    expect(host.querySelector('h2')?.id).toBe('conditional-routing-syntax');
  });
});
