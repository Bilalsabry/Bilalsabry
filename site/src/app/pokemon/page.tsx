import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import data from "../../../public/pokemon/cards.json";
import Binder from "./Binder";
import type { Card } from "./types";
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

export default function PokemonPage() {
  return (
    <div className={`pk ${display.variable}`}>
      <Binder cards={data.cards as Card[]} />
    </div>
  );
}
