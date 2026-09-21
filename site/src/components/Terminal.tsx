"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  profile,
  projects,
  timeline,
  pillars,
  stats,
  facts,
} from "@/lib/data";
import { copyText, openExternal, scrollToId, sections } from "@/lib/actions";
import { toast } from "./Toast";

type Line = { kind: "in" | "out" | "err" | "sys"; text: string };

const BANNER = [
  " ____  _ _       _    ____        _",
  "| __ )(_) | __ _| |  / ___|  __ _| |__  _ __ _   _",
  "|  _ \\| | |/ _` | |  \\___ \\ / _` | '_ \\| '__| | | |",
  "| |_) | | | (_| | |   ___) | (_| | |_) | |  | |_| |",
  "|____/|_|_|\\__,_|_|  |____/ \\__,_|_.__/|_|   \\__, |",
  "                                             |___/",
];

const FILES: Record<string, () => string[]> = {
  "about.txt": () => [profile.thesis, "", `Location: ${profile.location}`],
  "projects.md": () =>
    projects.flatMap((p) => [
      `## ${p.title}  (${p.year} · ${p.status})`,
      `   ${p.tagline}`,
      `   stack: ${p.stack.join(", ")}`,
      p.href ? `   ${p.href}` : "",
      "",
    ]),
  "path.log": () =>
    timeline.map((t) => `${t.when.padEnd(10)} ${t.org} — ${t.role} (${t.where})`),
  "receipts.csv": () => [
    "value,label",
    ...stats.map((s) => `${s.value},${s.label}`),
  ],
  "approach.txt": () =>
    pillars.flatMap((p) => [`[${p.title.toUpperCase()}]`, p.body, ""]),
  "facts.txt": () => facts,
};

const HELP = [
  "Available commands:",
  "  help              this list",
  "  whoami            who you're talking to",
  "  ls                list files",
  "  cat <file>        read a file (try: cat projects.md)",
  "  go <section>      scroll to a section (" + sections.map((s) => s.id).join(", ") + ")",
  "  open <thing>      linkedin · github · krux · evidence",
  "  email             copy my email address",
  "  neofetch          system info, sort of",
  "  date              current time, my timezone",
  "  clear             wipe the screen",
  "  exit              close the terminal  (or press ` / esc)",
];

function neofetch(): string[] {
  const ua = navigator.userAgent;
  const os = /Mac/.test(ua)
    ? "macOS"
    : /Win/.test(ua)
    ? "Windows"
    : /Linux/.test(ua)
    ? "Linux"
    : /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
    ? "Android"
    : "Unknown";
  return [
    `bilal@bilalsabry.com`,
    `-------------------`,
    `Role:      ${profile.roles.join(" / ")}`,
    `Base:      ${profile.location}`,
    `Building:  ${projects[0].title} — ${projects[0].tagline}`,
    `Shipping:  ${projects[1].title} (${projects[1].status})`,
    `Stack:     Rust · Next.js · Production AI · FP&A`,
    `School:    UC Berkeley — Economics & Data Science`,
    `Visitor:   ${os} · ${window.innerWidth}×${window.innerHeight} · ${
      Intl.DateTimeFormat().resolvedOptions().timeZone
    }`,
  ];
}

/**
 * A hidden terminal for the curious. Toggle with the backtick key, or via
 * the ⌘K palette. Everything it prints comes from the same data.ts the rest
 * of the site uses, so it never drifts out of date.
 */
export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);

  const print = useCallback((kind: Line["kind"], text: string | string[]) => {
    const arr = Array.isArray(text) ? text : [text];
    setLines((l) => [...l, ...arr.map((t) => ({ kind, text: t }))]);
  }, []);

  const exec = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      print("in", cmd);
      if (!cmd) return;
      const [name, ...rest] = cmd.split(/\s+/);
      const arg = rest.join(" ").toLowerCase();

      switch (name.toLowerCase()) {
        case "help":
        case "?":
          print("out", HELP);
          break;
        case "whoami":
          print("out", [
            `${profile.name} — ${profile.roles.join(", ").toLowerCase()}.`,
            profile.thesis,
          ]);
          break;
        case "ls":
          print("out", Object.keys(FILES).join("   "));
          break;
        case "cat": {
          const f = FILES[arg];
          if (!arg) print("err", "usage: cat <file>");
          else if (!f) print("err", `cat: ${arg}: No such file`);
          else print("out", f());
          break;
        }
        case "go":
        case "cd": {
          const s = sections.find((x) => x.id === arg || x.label.toLowerCase() === arg);
          if (!s) print("err", `go: unknown section "${arg}"`);
          else {
            print("sys", `→ ${s.label}`);
            scrollToId(s.id);
          }
          break;
        }
        case "open": {
          const map: Record<string, string> = {
            linkedin: profile.links.linkedin,
            github: profile.links.github,
            krux: profile.links.krux,
            evidence: projects.find((p) => p.id === "evidence")?.href ?? "",
          };
          const url = map[arg];
          if (!url) print("err", `open: try one of ${Object.keys(map).join(", ")}`);
          else {
            print("sys", `opening ${url}`);
            openExternal(url);
          }
          break;
        }
        case "email":
        case "mail": {
          const ok = await copyText(profile.email);
          print(ok ? "sys" : "out", ok ? `copied ${profile.email}` : profile.email);
          if (ok) toast("Email copied");
          break;
        }
        case "neofetch":
        case "fetch":
          print("out", [...BANNER, "", ...neofetch()]);
          break;
        case "date":
          print(
            "out",
            new Date().toLocaleString("en-US", {
              timeZone: "America/New_York",
              dateStyle: "full",
              timeStyle: "long",
            })
          );
          break;
        case "clear":
          setLines([]);
          break;
        case "exit":
        case "quit":
        case "q":
          setOpen(false);
          break;
        case "sudo":
          print("err", "nice try.");
          break;
        case "rm":
          print("err", "rm: permission denied (this is my website)");
          break;
        case "pwd":
          print("out", "/home/bilal/bilalsabry.com");
          break;
        case "echo":
          print("out", rest.join(" "));
          break;
        default:
          print("err", `command not found: ${name}. Type "help".`);
      }
    },
    [print]
  );

  // open / close hotkeys + external event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing =
        (t?.tagName === "INPUT" && t !== inputRef.current) ||
        t?.tagName === "TEXTAREA" ||
        t?.isContentEditable;
      if (e.key === "`" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    const onEvt = (e: Event) => {
      const d = (e as CustomEvent<{ open?: boolean }>).detail;
      setOpen(d?.open ?? true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("bs:terminal", onEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("bs:terminal", onEvt);
    };
  }, [open]);

  // boot banner on first open, focus on every open
  useEffect(() => {
    if (!open) return;
    if (!booted.current) {
      booted.current = true;
      print("sys", [
        ...BANNER,
        "",
        `Welcome. You found the terminal. Type "help" to look around.`,
        "",
      ]);
    }
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open, print]);

  // autoscroll
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = input;
      setInput("");
      setHIdx(-1);
      if (v.trim()) setHist((h) => [v, ...h].slice(0, 50));
      exec(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(hist.length - 1, hIdx + 1);
      if (n >= 0) {
        setHIdx(n);
        setInput(hist[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = hIdx - 1;
      setHIdx(n);
      setInput(n >= 0 ? hist[n] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [name, ...rest] = input.split(/\s+/);
      const partial = rest.join(" ");
      if (name === "cat") {
        const m = Object.keys(FILES).find((f) => f.startsWith(partial));
        if (m) setInput(`cat ${m}`);
      } else if (name === "go") {
        const m = sections.find((s) => s.id.startsWith(partial));
        if (m) setInput(`go ${m.id}`);
      } else {
        const cmds = ["help", "whoami", "ls", "cat ", "go ", "open ", "email", "neofetch", "date", "clear", "exit"];
        const m = cmds.find((c) => c.startsWith(name));
        if (m) setInput(m);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const color: Record<Line["kind"], string> = {
    in: "var(--fg)",
    out: "var(--fg-dim)",
    err: "#ff8a8a",
    sys: "var(--accent)",
  };

  return (
    <div
      role="dialog"
      aria-label="Terminal"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 105,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 16px 24px",
        background: "rgba(4,5,7,0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          width: "min(860px, 100%)",
          height: "min(60vh, 520px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          overflow: "hidden",
          background: "rgba(8,10,13,0.94)",
          border: "1px solid var(--line-strong)",
          boxShadow: "0 40px 120px -30px rgba(0,0,0,0.9), 0 0 60px -20px rgba(110,240,200,0.25)",
          animation: "bs-term-in .28s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* title bar */}
        <div
          className="mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderBottom: "1px solid var(--line)",
            fontSize: 11.5,
            color: "var(--fg-faint)",
            letterSpacing: "0.06em",
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span
              key={c}
              onClick={(e) => {
                e.stopPropagation();
                if (c === "#ff5f57") setOpen(false);
              }}
              style={{ width: 11, height: 11, borderRadius: 999, background: c, opacity: 0.9 }}
            />
          ))}
          <span style={{ marginLeft: 10 }}>bilal@bilalsabry.com — zsh</span>
          <span style={{ marginLeft: "auto" }}>` to toggle · esc to close</span>
        </div>

        {/* output */}
        <div
          ref={bodyRef}
          className="mono"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 16px 6px",
            fontSize: 13,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {lines.map((l, i) => (
            <div key={i} style={{ color: color[l.kind] }}>
              {l.kind === "in" ? (
                <>
                  <span style={{ color: "var(--accent)" }}>❯ </span>
                  {l.text}
                </>
              ) : (
                l.text || "\u00a0"
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
            <span style={{ color: "var(--accent)" }}>❯&nbsp;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal input"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                flex: 1,
                background: "transparent",
                border: 0,
                outline: 0,
                color: "var(--fg)",
                font: "inherit",
                caretColor: "var(--accent)",
              }}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bs-term-in {
          from { opacity: 0; transform: translateY(24px) }
          to   { opacity: 1; transform: none }
        }
        @media (prefers-reduced-motion: reduce) { [aria-label="Terminal"] > div { animation: none !important } }
      `}</style>
    </div>
  );
}
