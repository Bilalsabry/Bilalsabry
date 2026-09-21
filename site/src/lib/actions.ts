// ---------------------------------------------------------------------------
// Shared "things a visitor can do" — used by the ⌘K palette and the terminal
// so both surfaces stay in sync. Pure data + tiny helpers; no React.
// ---------------------------------------------------------------------------

import { profile, projects } from "./data";

export type Action = {
  id: string;
  label: string;
  hint?: string; // right-aligned meta (e.g. "Section", "↗")
  keywords?: string;
  group: "Navigate" | "Connect" | "Work" | "Fun";
  run: () => void;
};

export const sections = [
  { id: "top", label: "Top" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (history.replaceState) history.replaceState(null, "", `#${id}`);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Fires a custom event that App-level listeners (terminal, toast) react to. */
export function emit(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function buildActions(onToast: (m: string) => void): Action[] {
  const nav: Action[] = sections.map((s) => ({
    id: `go-${s.id}`,
    label: `Go to ${s.label}`,
    hint: "Section",
    keywords: `jump scroll ${s.label}`,
    group: "Navigate",
    run: () => scrollToId(s.id),
  }));

  const connect: Action[] = [
    {
      id: "copy-email",
      label: "Copy email address",
      hint: profile.email,
      keywords: "mail contact reach",
      group: "Connect",
      run: async () => {
        const ok = await copyText(profile.email);
        onToast(ok ? "Email copied" : "Couldn’t copy — " + profile.email);
      },
    },
    {
      id: "email",
      label: "Send an email",
      hint: "↗",
      keywords: "mailto write",
      group: "Connect",
      run: () => (window.location.href = `mailto:${profile.email}`),
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      hint: "↗",
      keywords: "social profile",
      group: "Connect",
      run: () => openExternal(profile.links.linkedin),
    },
    {
      id: "github",
      label: "GitHub",
      hint: "↗",
      keywords: "code source repos",
      group: "Connect",
      run: () => openExternal(profile.links.github),
    },
    {
      id: "copy-url",
      label: "Copy link to this site",
      hint: "bilalsabry.com",
      keywords: "share url",
      group: "Connect",
      run: async () => {
        const ok = await copyText("https://bilalsabry.com");
        onToast(ok ? "Link copied" : "Couldn’t copy");
      },
    },
  ];

  const work: Action[] = projects
    .filter((p) => p.href)
    .map((p) => ({
      id: `open-${p.id}`,
      label: `Open ${p.title}`,
      hint: "↗",
      keywords: `${p.line} ${p.tags.join(" ")}`,
      group: "Work",
      run: () => openExternal(p.href!),
    }));

  const fun: Action[] = [
    {
      id: "terminal",
      label: "Open terminal",
      hint: "`",
      keywords: "console shell cli hacker",
      group: "Fun",
      run: () => emit("bs:terminal", { open: true }),
    },
    {
      id: "print",
      label: "Print / save as PDF",
      hint: "⌘P",
      keywords: "resume cv",
      group: "Fun",
      run: () => window.print(),
    },
  ];

  return [...nav, ...connect, ...work, ...fun];
}

/** Cheap fuzzy match: every character of the query appears in order. */
export function fuzzy(query: string, text: string): number {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return 1;
  if (t.includes(query.toLowerCase())) return 3; // substring beats scattered
  let ti = 0;
  let score = 0;
  for (const ch of q) {
    const idx = t.indexOf(ch, ti);
    if (idx === -1) return 0;
    score += idx === ti ? 2 : 1; // reward contiguous runs
    ti = idx + 1;
  }
  return score / (q.length * 2);
}
