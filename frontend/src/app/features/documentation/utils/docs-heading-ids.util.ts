import GithubSlugger from 'github-slugger';

export function ensureDocsHeadingIds(host: HTMLElement): void {
  const slugger = new GithubSlugger();

  host.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6').forEach((heading) => {
    if (heading.id) {
      return;
    }

    heading.id = slugger.slug(heading.textContent ?? '');
  });
}
