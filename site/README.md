# bilalsabry.com

One clean page. **I build companies, and the software that runs them.**

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** for tokens; most styling is inline + `globals.css`
- No animation or scroll libraries. Everything is CSS + a few small hooks.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Editing content

**Everything is in [`src/lib/data.ts`](src/lib/data.ts)** — headline, intro,
the four numbers, three projects, and the career path. No component edits
needed to change copy.

## Structure

```
src/
  app/
    layout.tsx        fonts, metadata, JSON-LD
    page.tsx          Nav · Hero · Proof · Work · About · Contact
    globals.css       tokens (light by default, dark via prefers-color-scheme)
    sitemap.ts · robots.ts · manifest.ts · opengraph-image.tsx · icon.tsx
  lib/
    data.ts           ← all content
    actions.ts        shared actions for the palette + terminal
  components/
    Hero / Proof / Work / About / Contact / Nav
    CommandPalette    ⌘K / Ctrl+K / "/" — fuzzy search, also the mobile menu
    Terminal          press ` — help, whoami, ls, cat, go, open, neofetch…
    Rotator · LocalTime · Magnetic · Reveal · Toast
```

## Features

- Light and dark, following the system setting.
- ⌘K command palette and a hidden terminal, both driven by `data.ts`.
- Live Princeton clock, count-up numbers, click-to-copy email.
- `sitemap.xml`, `robots.txt`, web manifest, Open Graph card, JSON-LD Person.
- Respects `prefers-reduced-motion`. Clean print stylesheet.

## Deploying (Vercel)

Root Directory is `site`. Production deploys from `main`. Domain
`bilalsabry.com` is attached in the project's Domains tab.
