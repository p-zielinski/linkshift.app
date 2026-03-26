import { BlogArticle } from './blog.types';

export const BLOG_ARTICLE_TEMPLATE: BlogArticle = {
  slug: 'new-article-slug',
  title: 'Article title',
  description: 'Short article summary for the blog list and meta description.',
  seoTitle: 'Article SEO title',
  seoDescription: 'Article SEO description.',
  competitor: 'Competitor or topic name',
  category: 'link-management',
  publishedAt: '2026-03-26',
  updatedAt: '2026-03-26',
  factCheckedAt: '2026-03-26',
  readTimeMinutes: 6,
  tags: ['comparison', 'redirects', 'link maps'],
  heroHighlights: [
    'Most important insight 1',
    'Most important insight 2',
    'Most important insight 3',
  ],
  comparisonRows: [
    {
      area: 'Comparison area',
      linkshift: 'How LinkShift handles it',
      competitor: 'How the competitor handles it',
    },
  ],
  sections: [
    {
      title: 'Article section',
      paragraphs: ['Paragraph 1', 'Paragraph 2'],
      bullets: ['Bullet 1', 'Bullet 2'],
      media: [
        {
          type: 'image',
          src: '/blog/replace-me.png',
          alt: 'Image description',
          caption: 'Optional caption',
        },
      ],
    },
  ],
  honestWhenCompetitorWins: ['Fair-case scenario 1', 'Fair-case scenario 2'],
  references: [{ label: 'Official source', href: 'https://example.com' }],
};
