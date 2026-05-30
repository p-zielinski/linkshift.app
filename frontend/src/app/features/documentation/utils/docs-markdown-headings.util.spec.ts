import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';

marked.use(gfmHeadingId());

describe('docs markdown headings', () => {
  it('generates GitHub-style heading ids for anchor links', () => {
    const html = marked.parse('### Engine limits (at a glance)') as string;

    expect(html).toContain('id="engine-limits-at-a-glance"');
  });
});
