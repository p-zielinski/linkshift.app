# Blog Authoring Guide

This document describes a fast workflow for adding new comparison articles.

## 1. Add a new entry to the data

File: `frontend/src/app/features/marketing/blog/blog-articles.data.ts`

1. Copy an object from `blog-article.template.ts`.
2. Fill in `slug`, `title`, `description`, `seoTitle`, `seoDescription`.
3. Set dates:
   - `publishedAt` only for the first publication,
   - `updatedAt` for every edit,
   - `factCheckedAt` after re-checking sources.
4. Add sections and comparison rows.
5. Add only official, public sources to `references`.

## 2. Links and SEO

1. Publish every article under `/blog/<slug>`.
2. Add a route for the slug in `frontend/src/app/app.routes.ts` (the `blog/...` section).
3. The `/blog` listing page shows the entry automatically after adding the object.
4. After adding the entry, update:
   - `frontend/public/sitemap.xml`
   - `frontend/public/llms.txt` (Blog section)

## 3. Media (images and video)

The article model supports a `media` field in every section.

Example:

```ts
media: [
  {
    type: 'image',
    src: '/blog/my-article/diagram.webp',
    alt: 'Redirect flow diagram',
    caption: 'Optional description',
  },
  {
    type: 'video',
    src: '/blog/my-article/demo.mp4',
    alt: 'Configuration demo',
  },
];
```

The UI currently has media slots ready. Once real image/video rendering is added, the data model does not need changes.

## 4. Pre-publish checklist

1. Does the comparison include a section like "when the competitor may be better"?
2. Do all claims have an official source?
3. Are `seoTitle` and `seoDescription` unique?
4. Is the slug short and stable?
5. Was the article added to `sitemap.xml` and `llms.txt`?
