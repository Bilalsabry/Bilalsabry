// ---------------------------------------------------------------------------
// All site copy lives here. Keep it short — the page is meant to be read in
// under a minute.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Bilal Sabry",
  roles: ["founder", "engineer", "economist", "operator"],
  location: "Princeton, NJ",
  email: "bilal@berkeley.edu",
  links: {
    linkedin: "https://linkedin.com/in/bilal-sabry",
    github: "https://github.com/Bilalsabry",
    krux: "https://krux.bio",
  },
  // The one sentence.
  headline: {
    lead: "I build companies,",
    italic: "and the software that runs them.",
  },
  // The proof, in one breath.
  intro:
    "Currently building Krux AI, the proposal brain for pharma manufacturers. Before that: strategy and finance for a pharma CDMO, and policy research for Sri Lanka’s Minister of Finance during a sovereign default. UC Berkeley, Economics and Data Science, finished in two and a half years.",
  status: "Building Krux AI",
};

export type Stat = {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
};

export const stats: Stat[] = [
  { target: 2.9, prefix: "$", suffix: "B", decimals: 1, label: "IMF bailout modeled for Sri Lanka" },
  { target: 25, suffix: "h → min", label: "Pharma RFP cycle, compressed by Krux" },
  { target: 2.5, suffix: " yrs", decimals: 1, label: "For a double degree at Berkeley" },
  { target: 21, label: "Age as a UN General Assembly delegate" },
];

export type Project = {
  id: string;
  title: string;
  line: string;
  tags: string[];
  year: string;
  href?: string;
};

export const projects: Project[] = [
  {
    id: "krux",
    title: "Krux AI",
    line: "Turns a 300-page pharma RFP into a regulator-grade proposal in minutes. My company; I build the product and run the business.",
    tags: ["Founder", "Next.js", "Production AI"],
    year: "2025 →",
    href: "https://krux.bio",
  },
  {
    id: "evidence",
    title: "evidence",
    line: "A local-first AI research assistant in Rust that refuses to answer without span-level citations. Open source, 60+ tests, full CI.",
    tags: ["Rust", "ONNX", "SQLite"],
    year: "2026",
    href: "https://github.com/Bilalsabry/evidence",
  },
  {
    id: "srilanka",
    title: "Ministry of Finance, Sri Lanka",
    line: "Built the fiscal and debt-restructuring scenarios used in live IMF negotiations, reporting to the Minister, during the country’s default.",
    tags: ["Sovereign debt", "Policy"],
    year: "2022",
  },
];

export type Step = { when: string; org: string; role: string };

export const path: Step[] = [
  { when: "2025 →", org: "Krux AI", role: "Founder" },
  { when: "2024 →", org: "TCG GreenChem", role: "Strategy & Finance Lead, reporting to the CEO" },
  { when: "2023", org: "Patamar Capital · Microsoft", role: "VC diligence · Product strategy" },
  { when: "2022", org: "Ministry of Finance, Sri Lanka", role: "Policy Research Analyst" },
  { when: "2021 – 24", org: "UC Berkeley", role: "B.A. Economics & Data Science" },
];
