import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import data from "../../../public/pokemon/cards.json";
import Binder from "./Binder";
import path from "node:path";
import { imageSize } from "./imageSize";
import type { Card, ViewCard } from "./types";
import "./pokemon.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Unlisted on purpose: not in the sitemap, not linked from the home page,
// and asked not to be indexed. Reachable by URL or through the easter eggs.
export const metadata: Metadata = {
  title: "Binder Ledger",
  description:
    "Every card in the binder, with its latest market estimate, grade, and long-term outlook.",
  alternates: { canonical: "/pokemon" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Binder Ledger",
    description: "Every card in the binder, with its latest market estimate.",
    type: "website",
    url: "https://bilalsabry.com/pokemon",
  },
};

const DIR = path.join(process.cwd(), "public", "pokemon");
const ratio = (rel: string) => {
  const s = imageSize(path.join(DIR, rel));
  return s && s[1] ? s[0] / s[1] : null;
};

/** Runs at build time: measures each photo and picks up optional hero images. */
function prepare(cards: Card[]): ViewCard[] {
  return cards.map((c) => {
    const heroRel = `hero/${c.id}.webp`;
    const heroAr = ratio(heroRel);
    return {
      ...c,
      ar: c.img ? ratio(c.img) : null,
      ...(heroAr ? { hero: { src: heroRel, ar: heroAr } } : {}),
    };
  });
}

export default function PokemonPage() {
  return (
    <div className={`pk ${display.variable}`}>
      <Binder cards={prepare(data.cards as Card[])} />
    </div>
  );
}
