// Theme = "light" | "dark" | "system". Stored in localStorage; applied as
// data-theme on <html>. "system" removes the attribute so the CSS media
// query decides. A tiny inline script in layout.tsx applies the stored
// value before first paint so there is no flash.

export type Theme = "light" | "dark" | "system";
const KEY = "theme";
export const THEME_EVENT = "bs:theme";

export function getTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "light" || t === "dark") return t;
  } catch {}
  return "system";
}

/** What is actually showing right now. */
export function resolvedTheme(): "light" | "dark" {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(t: Theme) {
  try {
    if (t === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, t);
  } catch {}
  if (t === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

export function toggleTheme() {
  setTheme(resolvedTheme() === "dark" ? "light" : "dark");
}

/** Inline, runs before hydration. Keep it tiny and dependency-free. */
export const THEME_BOOT_SCRIPT =
  `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
