# chrissenanayake.com

Personal website of Dr. Chris H. Senanayake. Static site built with [Astro](https://astro.build), no database, deployable for free on Cloudflare Pages (or Netlify, Vercel, GitHub Pages).

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
```

## Content

- `src/data/profile.json` — biography, career, education, awards, medicines, links, email. Edit this to change page text.
- `src/data/publications.json` — the publication list. One object per paper: `title`, `authors`, `journal`, `year`, `doi`, optional `pmid`, `volume`, `issue`, `pages`.
- `public/portrait.jpg` — add a photo and swap the placeholder in `src/pages/index.astro`.

### Importing publications

The initial list was pulled from PubMed. To add the full list from Google Scholar: open the Scholar profile, select all publications, **Export → BibTeX**, save the file, then run:

```bash
npm run import:bibtex -- citations.bib
```

Entries are de-duplicated by DOI or title, so it is safe to re-run.

### Hosting PDFs

Only host PDFs you have the right to distribute (open-access papers and author-accepted manuscripts). Put them in `public/papers/` and add `"pdf": "/papers/filename.pdf"` to the entry, or store them in Cloudflare R2 and link the full URL.

## Deploy (Cloudflare Pages)

1. Push this repository to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build command `npm run build`, output directory `dist`, root directory `chrissenanayake`.
4. Add the custom domain `chrissenanayake.com` under the project's Custom domains tab.
