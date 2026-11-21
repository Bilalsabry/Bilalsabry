// Shape of public/pokemon/cards.json. To update prices, replace that file
// (and drop new photos into public/pokemon/img/). Nothing else needs to change.

export type Estimate = { d: string; low: number; high: number; note?: string };

export type Card = {
  id: string;
  name: string;
  set: string;
  num: string;
  grade: string; // "Raw" or e.g. "PSA 10", "CGC 9.5"
  qty: number;
  low: number; // per copy, USD
  high: number;
  asOf: string; // YYYY-MM-DD
  outlook: string; // "best" | "steady" | "low" | ""
  basis: string;
  src: string;
  img: string; // relative to /pokemon/, may be empty
  history: Estimate[];
};
