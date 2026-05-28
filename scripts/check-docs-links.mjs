#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import GithubSlugger from '../frontend/node_modules/github-slugger/index.js';

const pagesDir = 'shared/docs/pages';
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) files.push(p);
  }
}
walk(pagesDir);

function slugifyHeading(text) {
  const slugger = new GithubSlugger();
  const plain = text.replace(/<[^>]+>/g, '').replace(/[`*_~]/g, '').trim();
  return slugger.slug(plain);
}

const anchorsByFile = new Map();
for (const f of files) {
  const slugger = new GithubSlugger();
  const content = fs.readFileSync(f, 'utf8');
  const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) =>
    slugger.slug(m[1].replace(/[`*_~]/g, '').trim()),
  );
  anchorsByFile.set(f, new Set(headings));
}

const issues = [];
const linkRe = /\]\(([^)]+)\)/g;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = linkRe.exec(content))) {
    let target = m[1].split(/\s/)[0];
    if (target.startsWith('http') || target.startsWith('mailto:')) continue;
    const hashIdx = target.indexOf('#');
    const anchor = hashIdx >= 0 ? target.slice(hashIdx + 1) : null;
    const filePart = hashIdx >= 0 ? target.slice(0, hashIdx) : target;
    if (!filePart) {
      if (anchor && !anchorsByFile.get(f)?.has(anchor))
        issues.push({ from: f, link: target, type: 'missing-anchor-same-file' });
      continue;
    }
    if (filePart.startsWith('/')) continue;
    const resolved = path.normalize(path.join(path.dirname(f), filePart));
    if (!fs.existsSync(resolved)) {
      issues.push({ from: f, link: target, type: 'missing-file' });
      continue;
    }
    if (anchor && !anchorsByFile.get(resolved)?.has(anchor)) {
      issues.push({ from: f, link: target, type: 'missing-anchor', resolved });
    }
  }
}
if (issues.length > 0) {
  console.error(`Found ${issues.length} broken internal doc link(s):\n`);
  console.error(JSON.stringify(issues, null, 2));
  process.exit(1);
}
console.log('All internal doc links OK.');
