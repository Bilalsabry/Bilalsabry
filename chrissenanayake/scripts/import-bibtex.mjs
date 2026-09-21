// Converts a BibTeX export (e.g. from Google Scholar: profile → export → BibTeX)
// into src/data/publications.json. Existing entries are matched by DOI or
// normalised title so re-running the script does not create duplicates.
//
//   node scripts/import-bibtex.mjs path/to/citations.bib
import { readFileSync, writeFileSync } from 'node:fs';

const [, , bibPath] = process.argv;
if (!bibPath) { console.error('usage: node scripts/import-bibtex.mjs <file.bib>'); process.exit(1); }

const OUT = new URL('../src/data/publications.json', import.meta.url);
const existing = JSON.parse(readFileSync(OUT, 'utf8'));
const bib = readFileSync(bibPath, 'utf8');

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const clean = (s) => s.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
const entries = [];
for (const m of bib.matchAll(/@(\w+)\s*\{[^,]*,([\s\S]*?)\n\}/g)) {
  const fields = {};
  for (const f of m[2].matchAll(/(\w+)\s*=\s*(\{((?:[^{}]|\{[^{}]*\})*)\}|"([^"]*)"|(\d+))/g)) {
    fields[f[1].toLowerCase()] = clean(f[3] ?? f[4] ?? f[5] ?? '');
  }
  if (!fields.title) continue;
  const authors = (fields.author ?? '').split(/\s+and\s+/).map((a) => {
    const [last, first] = a.split(',').map((x) => x.trim());
    if (!first) return a.trim();
    const initials = first.split(/[\s.]+/).filter(Boolean).map((x) => x[0].toUpperCase()).join('');
    return `${initials} ${last}`;
  });
  entries.push({
    doi: fields.doi || null,
    title: fields.title.replace(/\.$/, ''),
    authors,
    journal: fields.journal || fields.booktitle || fields.publisher || '',
    year: Number(fields.year) || 0,
    volume: fields.volume || null,
    issue: fields.number || null,
    pages: fields.pages?.replace(/--/g, '–') || null,
  });
}

const byKey = new Map();
for (const p of existing) byKey.set(p.doi ? `doi:${p.doi.toLowerCase()}` : `t:${norm(p.title)}`, p);
let added = 0;
for (const e of entries) {
  const key = e.doi ? `doi:${e.doi.toLowerCase()}` : `t:${norm(e.title)}`;
  const dup = byKey.get(key) ?? [...byKey.values()].find((p) => norm(p.title) === norm(e.title));
  if (dup) { for (const k of Object.keys(e)) if (!dup[k] && e[k]) dup[k] = e[k]; continue; }
  byKey.set(key, e); added++;
}
const merged = [...byKey.values()].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
writeFileSync(OUT, JSON.stringify(merged, null, 2) + '\n');
console.log(`parsed ${entries.length} BibTeX entries, added ${added}, total ${merged.length}`);
