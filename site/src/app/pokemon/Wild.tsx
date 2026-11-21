"use client";

import { useEffect, useRef } from "react";

/**
 * Wild Pokémon that wander the page. Three kinds of movement:
 *   - walkers stroll along the top edge of a row of cards and hop the gaps
 *   - flyers cross the screen on a wavy path (Rayquaza, the legendary birds…)
 *   - peekers pop up from behind a card; Drifloon just floats away upward
 * Everything is driven by one requestAnimationFrame loop that writes
 * transforms directly, so React never re-renders. Sprites load on demand.
 * Off when the visitor prefers reduced motion or switches it off.
 */

type Mon = { name: string; w: number; h: number; scale?: number; speed?: number };

const WALKERS: Mon[] = [
  { name: "pikachu", w: 60, h: 60 },
  { name: "eevee", w: 64, h: 55 },
  { name: "raichu", w: 69, h: 103, scale: 0.62 },
  { name: "bulbasaur", w: 45, h: 49 },
  { name: "squirtle", w: 53, h: 54 },
  { name: "charmeleon", w: 60, h: 70, scale: 0.8 },
  { name: "meowth", w: 49, h: 61, scale: 0.9 },
  { name: "sprigatito", w: 38, h: 55 },
  { name: "scorbunny", w: 54, h: 94, scale: 0.62 },
  { name: "sylveon", w: 59, h: 86, scale: 0.7 },
];
const FLYERS: Mon[] = [
  { name: "rayquaza", w: 142, h: 153, scale: 1.25, speed: 230 },
  { name: "dragonite", w: 85, h: 98, speed: 170 },
  { name: "lugia", w: 156, h: 127, speed: 200 },
  { name: "ho-oh", w: 157, h: 144, speed: 190 },
  { name: "articuno", w: 172, h: 171, scale: 0.8, speed: 190 },
  { name: "zapdos", w: 145, h: 106, speed: 240 },
  { name: "moltres", w: 217, h: 181, scale: 0.7, speed: 200 },
  { name: "latias", w: 108, h: 69, speed: 280 },
  { name: "mew", w: 40, h: 51, scale: 1.2, speed: 150 },
  { name: "celebi", w: 67, h: 65, speed: 150 },
  { name: "jirachi", w: 92, h: 68, speed: 140 },
];
const PEEKERS: Mon[] = [
  { name: "gengar", w: 84, h: 78, scale: 0.8 },
  { name: "haunter", w: 85, h: 73, scale: 0.8 },
];
const DRIFLOON: Mon = { name: "drifloon", w: 32, h: 75 };

type Actor = { layer: "page" | "sky"; update: (dt: number) => boolean; destroy: () => void };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const ease = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

export default function Wild({ enabled, paused }: { enabled: boolean; paused: boolean }) {
  const page = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const pageEl = page.current;
    const skyEl = sky.current;
    if (!enabled || !pageEl || !skyEl) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const actors = new Set<Actor>();
    const timers = new Set<number>();
    let raf = 0;
    let last = 0;
    let dead = false;
    const small = () => window.innerWidth < 600;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const a of [...actors]) {
        if (!a.update(dt)) {
          a.destroy();
          actors.delete(a);
        }
      }
      raf = actors.size ? requestAnimationFrame(loop) : 0;
    };
    const add = (a: Actor) => {
      actors.add(a);
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (!dead) fn();
      }, ms);
      timers.add(id);
    };

    /** Creates the sprite element. Resolves once the GIF is ready to show. */
    const spawn = async (mon: Mon, layer: HTMLElement) => {
      const s = (mon.scale ?? 1) * (small() ? 0.85 : 1);
      const w = Math.round(mon.w * s);
      const h = Math.round(mon.h * s);
      const box = document.createElement("div");
      box.className = "pk-mon";
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
      const img = new Image();
      img.alt = "";
      img.draggable = false;
      img.width = w;
      img.height = h;
      img.src = `/pokemon/sprites/${mon.name}.gif`;
      box.appendChild(img);
      try {
        await img.decode();
      } catch {
        return null;
      }
      if (dead) return null;
      layer.appendChild(box);
      const state = { poke: 0 }; // seconds left of the "you clicked me" reaction
      box.addEventListener("click", () => (state.poke = 0.6));
      return { box, img, w, h, state };
    };

    /** Rows of cards whose top edge is comfortably on screen. */
    const visibleRows = (clearance: number) => {
      const rows = new Map<number, HTMLElement[]>();
      for (const el of document.querySelectorAll<HTMLElement>(".pk-grid .pk-card")) {
        const key = Math.round(el.getBoundingClientRect().top / 4);
        rows.set(key, [...(rows.get(key) ?? []), el]);
      }
      const bar = document.querySelector<HTMLElement>(".pk-bar")?.getBoundingClientRect();
      const min = Math.max(bar && bar.top <= 1 ? bar.bottom : 0, 0) + clearance + 6;
      return [...rows.values()]
        .filter((r) => {
          const top = r[0].getBoundingClientRect().top;
          return top > min && top < window.innerHeight - 60;
        })
        .map((r) => r.slice().sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left));
    };

    /** When the toolbar is pinned to the top, anything scrolling beneath it
     *  should disappear behind it, sprites included. */
    const barEl = document.querySelector<HTMLElement>(".pk-bar");
    const tuck = (box: HTMLElement) => {
      const bar = barEl?.getBoundingClientRect();
      const pinned = bar && bar.top <= 0.5 && getComputedStyle(barEl!).position === "sticky";
      const hide = pinned ? bar.bottom - box.getBoundingClientRect().top : 0;
      box.style.clipPath = hide > 0 ? `inset(${hide.toFixed(0)}px 0 0 0)` : "";
    };

    /* ---------------------------------------------------------- walker */
    const walker = async (mon: Mon) => {
      const s = await spawn(mon, pageEl);
      if (!s) return false;
      const rows = visibleRows(s.h);
      if (!rows.length) {
        s.box.remove();
        return false;
      }
      const dir = Math.random() < 0.5 ? 1 : -1;
      const row = pick(rows);
      const cards = dir > 0 ? row : row.slice().reverse();
      const M = 8; // keep clear of the rounded corners
      const speed = rand(48, 66);
      let k = 0;
      type Phase = "rise" | "walk" | "hop" | "idle" | "sink" | "poof";
      let phase: Phase = "rise";
      let t = 0;
      const go = (to: Phase) => {
        phase = to;
        t = 0;
      };
      let x = dir > 0 ? M : -1; // offset inside the current card; -1 = "start from the right edge"
      let clock = 0;
      // one pause somewhere along the way, to look around and bounce
      const restCard = Math.floor(rand(0, cards.length));
      let rested = false;
      const flip = dir > 0 ? -1 : 1; // sprites face left

      const geo = (i: number) => {
        const L = pageEl.getBoundingClientRect();
        const r = cards[i].getBoundingClientRect();
        return { left: r.left - L.left, top: r.top - L.top, width: r.width };
      };
      const place = (px: number, py: number, lift: number, clip: boolean) => {
        s.box.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
        s.box.style.overflow = clip ? "hidden" : "visible";
        s.img.style.transform = `translateY(${lift.toFixed(1)}px) scaleX(${flip})`;
        tuck(s.box);
      };

      add({
        layer: "page",
        destroy: () => s.box.remove(),
        update(dt) {
          clock += dt;
          t += dt;
          if (phase !== "poof" && cards.some((c) => !c.isConnected)) go("poof");
          if (phase === "poof") {
            s.box.style.opacity = String(Math.max(0, 1 - t / 0.25));
            return t < 0.25;
          }
          const g = geo(k);
          const end = g.width - s.w - M;
          if (x < 0) x = end;
          const feet = g.top - s.h + 3; // sink the feet a touch into the edge
          const poke = s.state.poke > 0 ? Math.sin((1 - s.state.poke / 0.6) * Math.PI) * 22 : 0;
          s.state.poke = Math.max(0, s.state.poke - dt);

          if (phase === "rise") {
            place(g.left + x, feet, s.h * (1 - ease(t / 0.55)), true);
            if (t >= 0.55) go("walk");
          } else if (phase === "walk") {
            x += dir * speed * dt;
            const step = Math.abs(Math.sin(clock * 11)) * 2.5; // little footsteps
            place(g.left + x, feet, -step - poke, false);
            const mid = g.width / 2 - s.w / 2;
            if (!rested && k === restCard && (dir > 0 ? x >= mid : x <= mid)) {
              rested = true;
              go("idle");
            } else if (dir > 0 ? x >= end : x <= M) {
              x = dir > 0 ? end : M;
              go(k === cards.length - 1 ? "sink" : "hop");
            }
          } else if (phase === "idle") {
            // two happy bounces, then carry on
            const b = t < 1 ? Math.abs(Math.sin(t * Math.PI * 2)) * 12 : 0;
            place(g.left + x, feet, -b - poke, false);
            if (t >= 1.5) go("walk");
          } else if (phase === "hop") {
            const n = geo(k + 1);
            const to = dir > 0 ? M : n.width - s.w - M;
            const p = Math.min(1, t / 0.4);
            const px = g.left + x + (n.left + to - (g.left + x)) * p;
            const py = feet + (n.top - s.h + 3 - feet) * p;
            place(px, py, -Math.sin(p * Math.PI) * 18 - poke, false);
            if (p >= 1) {
              k += 1;
              x = to;
              go("walk");
            }
          } else if (phase === "sink") {
            place(g.left + x, feet, s.h * ease(t / 0.5), true);
            return t < 0.5;
          }
          return true;
        },
      });
      return true;
    };

    /* ----------------------------------------------------------- flyer */
    const flyer = async (mon: Mon) => {
      const s = await spawn(mon, skyEl);
      if (!s) return false;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const speed = (mon.speed ?? 190) * (small() ? 0.7 : 1);
      const baseY = vh * rand(0.1, 0.5);
      const amp = rand(26, 64);
      const k = (Math.PI * 2) / rand(360, 620); // radians per pixel
      const ph = rand(0, 6.28);
      let x = dir > 0 ? -s.w - 20 : vw + 20;
      let spin = 0;
      const flip = dir > 0 ? -1 : 1;
      add({
        layer: "sky",
        destroy: () => s.box.remove(),
        update(dt) {
          x += dir * speed * dt;
          const y = baseY + amp * Math.sin(x * k + ph);
          const slope = amp * k * Math.cos(x * k + ph); // nose follows the path
          if (s.state.poke > 0) spin += (360 / 0.6) * dt; // clicked: do a loop
          else spin = 0;
          s.state.poke = Math.max(0, s.state.poke - dt);
          const tilt = (Math.atan(slope) * 180) / Math.PI;
          s.box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(tilt * 0.7 + spin).toFixed(1)}deg)`;
          s.img.style.transform = `scaleX(${flip})`;
          return dir > 0 ? x < vw + 30 : x > -s.w - 30;
        },
      });
      return true;
    };

    /* --------------------------------------------------------- balloon */
    const balloon = async () => {
      const s = await spawn(DRIFLOON, skyEl);
      if (!s) return false;
      const x0 = window.innerWidth * rand(0.08, 0.9);
      let y = window.innerHeight + 10;
      let clock = rand(0, 6);
      add({
        layer: "sky",
        destroy: () => s.box.remove(),
        update(dt) {
          clock += dt;
          y -= (s.state.poke > 0 ? 190 : 46) * dt;
          s.state.poke = Math.max(0, s.state.poke - dt);
          const sway = Math.sin(clock * 0.9) * 26;
          s.box.style.transform = `translate3d(${(x0 + sway).toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(Math.cos(clock * 0.9) * 7).toFixed(1)}deg)`;
          return y > -s.h - 20;
        },
      });
      return true;
    };

    /* ---------------------------------------------------------- peeker */
    const peeker = async (mon: Mon) => {
      const s = await spawn(mon, pageEl);
      if (!s) return false;
      const rows = visibleRows(s.h);
      if (!rows.length) {
        s.box.remove();
        return false;
      }
      const card = pick(pick(rows));
      const off = rand(0.15, 0.6);
      let t = 0;
      const hold = rand(1.6, 2.6);
      add({
        layer: "page",
        destroy: () => s.box.remove(),
        update(dt) {
          t += dt;
          if (!card.isConnected) return false;
          if (s.state.poke > 0) t = Math.max(t, 0.5 + hold); // clicked: duck back down
          s.state.poke = 0;
          const L = pageEl.getBoundingClientRect();
          const r = card.getBoundingClientRect();
          const up = t < 0.5 ? ease(t / 0.5) : t < 0.5 + hold ? 1 : 1 - ease((t - 0.5 - hold) / 0.45);
          const sway = t > 0.5 && t < 0.5 + hold ? Math.sin((t - 0.5) * 3) * 4 : 0;
          s.box.style.overflow = "hidden";
          s.box.style.transform = `translate3d(${(r.left - L.left + r.width * off).toFixed(1)}px, ${(r.top - L.top - s.h + 1).toFixed(1)}px, 0)`;
          s.img.style.transform = `translate(${sway.toFixed(1)}px, ${(s.h * (1 - up * 0.82)).toFixed(1)}px)`;
          tuck(s.box);
          return t < 0.5 + hold + 0.45;
        },
      });
      return true;
    };

    /* ------------------------------------------------------- scheduler */
    const busy = (layer: Actor["layer"]) => [...actors].some((a) => a.layer === layer);
    const idle = () => !document.hidden && !pausedRef.current;

    const next = async () => {
      if (idle()) {
        const roll = Math.random();
        if (roll < 0.45 && !busy("page")) {
          // no row of cards on screen right now? send a flyer instead
          if (!(await walker(pick(WALKERS))) && !busy("sky")) await flyer(pick(FLYERS));
        } else if (roll < 0.8 && !busy("sky")) await flyer(pick(FLYERS));
        else if (roll < 0.92 && !busy("page")) await peeker(pick(PEEKERS));
        else if (!busy("sky")) await balloon();
      }
      later(next, rand(6000, 12000));
    };

    // Opening act: Pikachu takes a walk, then Rayquaza flies over.
    later(async () => {
      if (idle() && !(await walker(WALKERS[0]))) await flyer(FLYERS[0]);
    }, 1600);
    later(async () => {
      if (idle() && !busy("sky")) await flyer(FLYERS[0]);
    }, 6500);
    later(next, 15000);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => clearTimeout(id));
      actors.forEach((a) => a.destroy());
      actors.clear();
    };
  }, [enabled]);

  return (
    <>
      <div ref={page} className="pk-wild page" aria-hidden />
      <div ref={sky} className="pk-wild sky" aria-hidden />
    </>
  );
}
