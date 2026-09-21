# bilalsabry.com — personal site

A dark, cinematic one-page personal site. **Builder × Operator × Thinker.**

Mock / v1 — content lives in one file and is easy to edit.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** for tokens/utilities; most styling is inline + `globals.css`
- **Motion** (Framer Motion) — scroll-linked illumination, counters
- **Lenis** — smooth scrolling
- **Raw WebGL** — the hero aurora shader (no heavy 3D dependency)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Editing content

**Everything you'd want to change is in [`src/lib/data.ts`](src/lib/data.ts)** —
name, rotating roles, the thesis line, the manifesto, the stat counters,
projects, the Build/Operate/Think pillars, and the timeline. No component
edits needed to update copy.

## Structure

```
src/
  app/
    layout.tsx          fonts (Inter / JetBrains Mono / Instrument Serif), metadata
    page.tsx            section composition
    globals.css         design tokens + utilities
  lib/data.ts           ← all content
  components/
    ShaderBackground    WebGL aurora hero (mouse-reactive, reduced-motion aware)
    Cursor              custom dot + lagging ring with hover labels
    SmoothScroll        Lenis + top progress bar
    Scramble            decode/scramble role cycler
    Reveal              IntersectionObserver scroll-in
    Hero / Manifesto / Stats / Work / Approach / Timeline / Contact
```

## Features

- **⌘K / Ctrl+K command palette** (also `/`) — fuzzy search over sections, links,
  projects; copy email; open the terminal. Doubles as the mobile menu.
- **Hidden terminal** — press `` ` ``. `help`, `whoami`, `ls`, `cat projects.md`,
  `go work`, `open github`, `neofetch`… All output is generated from `data.ts`.
- **Now section** — what I'm focused on this season, with a live Princeton clock.
- **Click-to-copy email** with a toast (⌘-click still opens the mail client).
- **Magnetic nav + links**, active-section highlighting, keyboard focus rings.
- **Print stylesheet** — ⌘P gives a clean light one-pager.
- **SEO for the domain** — `sitemap.xml`, `robots.txt`, web manifest, canonical
  URL, Open Graph/Twitter cards, and JSON-LD `Person` structured data.

## Deploying to bilalsabry.com (Vercel)

1. Import the repo in Vercel. If the site lives in `/site`, set **Root Directory**
   to `site`; if this folder is the repo root, leave it blank.
2. In the project's **Domains** tab add `bilalsabry.com` and `www.bilalsabry.com`.
3. At your registrar, point DNS at Vercel:
   - `A` record for `@` → `76.76.21.21`
   - `CNAME` for `www` → `cname.vercel-dns.com`
4. Vercel issues the TLS certificate automatically once DNS propagates.

## Notes

- Respects `prefers-reduced-motion` (shader, scramble, counters, reveals all degrade gracefully).
- Custom cursor only activates on fine-pointer devices; native cursor elsewhere.
- WebGL falls back to a static CSS gradient if unavailable.

## Ideas for v2

- Replace the email / links / handles with finalized ones; swap in a real domain.
- Per-project detail pages or a sticky "anatomy of a project" scroll teardown.
- A Remotion-rendered intro / OG video generated from the same React components.
- Sound-on-hover micro-interactions (toggleable).
