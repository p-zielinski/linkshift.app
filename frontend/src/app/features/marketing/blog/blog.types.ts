export type BlogMedia = {
  type: 'image' | 'video';
  src: string;
  alt: string;
  caption?: string;
};

export type BlogSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  media?: BlogMedia[];
};

export type BlogComparisonRow = {
  area: string;
  linkshift: string;
  competitor: string;
};

export type BlogReference = {
  label: string;
  href: string;
};

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  competitor: string;
  category: 'domain-path-redirection' | 'link-management' | 'ad-tech';
  publishedAt: string;
  updatedAt: string;
  factCheckedAt: string;
  readTimeMinutes: number;
  tags: string[];
  heroHighlights: string[];
  comparisonRows: BlogComparisonRow[];
  sections: BlogSection[];
  honestWhenCompetitorWins: string[];
  references: BlogReference[];
};
