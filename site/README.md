# bilalsabry.com

One quiet page. Name, one line, three short lists, contact.

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

**Everything is in [`src/lib/data.ts`](src/lib/data.ts)** — the intro line and
the Building / Now / Education lists. Add a row, change a note, done.

## Structure

```
src/
  app/
    layout.tsx        fonts, metadata, JSON-LD
    page.tsx          TopBar · Intro · Rows (per section) · Footer
    globals.css       tokens (light by default, dark via prefers-color-scheme)
    sitemap.ts · robots.ts · manifest.ts · opengraph-image.tsx · icon.tsx
  lib/
    data.ts           ← all content
    actions.ts        shared actions for the palette + terminal
  components/
    TopBar / Intro / Rows / Footer
    CommandPalette    ⌘K / Ctrl+K / "/" — fuzzy search, also the mobile menu
    Terminal          press ` — help, whoami, ls, cat, go, open, neofetch…
    LocalTime · Magnetic · Reveal · Toast
```

## Features

- Light and dark, following the system setting.
- ⌘K command palette and a hidden terminal, both driven by `data.ts`.
- Live New York clock, click-to-copy email.
- `sitemap.xml`, `robots.txt`, web manifest, Open Graph card, JSON-LD Person.
- Respects `prefers-reduced-motion`. Clean print stylesheet.

## Deploying (Vercel)

Root Directory is `site`. Production deploys from `main`. Domain
`bilalsabry.com` is attached in the project's Domains tab.
