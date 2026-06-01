// ---------------------------------------------------------------------------
// Site content. All copy lives here so it's trivial to edit.
// Sourced from Bilal Sabry's CV — placeholder polish welcome.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Bilal Sabry",
  roles: ["Founder", "Engineer", "Operator", "Strategist", "Analyst"],
  location: "Princeton, NJ",
  email: "bilal@berkeley.edu",
  links: {
    linkedin: "https://linkedin.com/in/bilal-sabry",
    github: "https://github.com/Bilalsabry",
    krux: "https://krux.bio",
  },
  // The one-line thesis, set in the display serif.
  thesis:
    "I build companies and the software that runs them — moving between the code, the deal, and the policy without losing the thread.",
};

export const manifesto = [
  "I operate across three registers most people keep separate:",
  "I ship production software, I run the numbers that decide whether a business lives,",
  "and I sit in the room where the strategy is set.",
  "The throughline is leverage — finding the one decision that moves everything,",
  "then building the system that makes it repeatable.",
];

export type Stat = {
  value: string;
  label: string;
  sub: string;
  // numeric target + suffix/prefix for the counter animation
  target: number;
  prefix?: string;
  suffix?: string;
};

export const stats: Stat[] = [
  {
    value: "48%",
    target: 48,
    suffix: "%",
    label: "Revenue growth, YoY",
    sub: "Scaled a pharma CDMO from <5% to 48% — past $25M.",
  },
  {
    value: "2,000%+",
    target: 2000,
    suffix: "%+",
    label: "EBITDA growth",
    sub: "Off a small base, in a single fiscal year. Overhead held under 7%.",
  },
  {
    value: "$2.9B",
    target: 2.9,
    prefix: "$",
    suffix: "B",
    label: "IMF bailout package",
    sub: "Built the fiscal scenarios used in real-time sovereign negotiations.",
  },
  {
    value: "2.5 yrs",
    target: 2.5,
    suffix: " yrs",
    label: "To a Berkeley degree",
    sub: "B.A. Economics & Data Science. Two majors, half the time.",
  },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  year: string;
  status: string;
  href?: string;
  accent: string; // hex used for the card's signature glow
};

export const projects: Project[] = [
  {
    id: "krux",
    index: "01",
    title: "Krux AI",
    tagline: "The AI company brain for pharma contract manufacturing.",
    description:
      "Founder & engineer. Compresses 25+ hour RFP response cycles into regulator-grade proposals. Built the full product surface — scoped retrieval, a compliance-matrix extractor for 300-page RFPs, a versioned answer library, and a tamper-evident audit export. First paid design partner signed.",
    stack: ["Next.js", "Supabase / RLS", "Vercel AI Gateway", "Azure ZDR"],
    year: "2025 →",
    status: "Building",
    href: "https://krux.bio",
    accent: "#6ef0c8",
  },
  {
    id: "evidence",
    index: "02",
    title: "evidence",
    tagline: "A local-first AI research assistant, in Rust.",
    description:
      "Open source. A multi-crate Cargo workspace running ONNX-Runtime embeddings and hybrid BM25 + vector retrieval with reciprocal rank fusion, over SQLite FTS5 + sqlite-vec, with byte-accurate span extraction via PDFium. Tauri 2 + React on top. v0.2.0, 60+ tests, full CI.",
    stack: ["Rust", "ONNX Runtime", "SQLite / sqlite-vec", "Tauri 2"],
    year: "2026",
    status: "v0.2.0 · open source",
    href: "https://github.com/Bilalsabry/evidence",
    accent: "#8a8cff",
  },
  {
    id: "greenchem",
    index: "03",
    title: "TCG GreenChem",
    tagline: "Strategy & finance, reporting to the CEO.",
    description:
      "Sole strategy and finance resource for a high-growth pharmaceutical CDMO. Owned M&A evaluation, JV structuring, capital advisory and board reporting. Re-rated a low-multiple services business toward a vertical-SaaS profile, structured a $30–50M Series A process, and took SAP live across the company.",
    stack: ["M&A", "FP&A from scratch", "JV structuring", "SAP go-live"],
    year: "2024 →",
    status: "Operating",
    accent: "#ffce6b",
  },
  {
    id: "srilanka",
    index: "04",
    title: "Ministry of Finance, Sri Lanka",
    tagline: "Policy research, Office of the Minister.",
    description:
      "Synthesized economic data and policy directly for the Minister during the worst sovereign default in 70 years. Built the fiscal-sustainability and debt-restructuring scenarios used in live IMF negotiations on a $2.9B bailout. Later, a UN General Assembly delegate with the Sri Lankan Mission — at 21.",
    stack: ["Sovereign debt", "Fiscal modeling", "IMF negotiations"],
    year: "2022",
    status: "Public service",
    accent: "#7fd1ff",
  },
];

export type Pillar = {
  k: string;
  title: string;
  body: string;
  tags: string[];
};

export const pillars: Pillar[] = [
  {
    k: "build",
    title: "Build",
    body: "I ship real software — Rust systems, production AI architecture, full-stack product. Not prototypes that demo well and break. Things with tests, CI, and users.",
    tags: ["Rust", "Production AI / RAG", "Next.js", "Systems design"],
  },
  {
    k: "operate",
    title: "Operate",
    body: "I run the numbers that decide whether a business lives — M&A, FP&A, deal structuring, restructuring. I've turned a low-multiple shop into a growth story and lived in the board deck.",
    tags: ["M&A", "Capital advisory", "FP&A", "Operational restructuring"],
  },
  {
    k: "think",
    title: "Think",
    body: "I do the analysis that informs hard calls — sovereign fiscal policy under default, venture diligence, market strategy. Trained as an economist; comfortable where the stakes are real.",
    tags: ["Economics", "Policy", "Diligence", "Strategy"],
  },
];

export type TimelineItem = {
  org: string;
  role: string;
  when: string;
  where: string;
  note: string;
};

export const timeline: TimelineItem[] = [
  {
    org: "Krux AI",
    role: "Founder — Business & Engineering",
    when: "2025 →",
    where: "Remote",
    note: "Building the company end-to-end: product, GTM, and fundraising.",
  },
  {
    org: "TCG GreenChem",
    role: "Strategic Projects & Finance Lead",
    when: "2024 →",
    where: "Princeton, NJ",
    note: "Reporting to the CEO. 48% YoY growth, 2,000%+ EBITDA.",
  },
  {
    org: "Patamar Capital",
    role: "Impact VC Intern",
    when: "2023",
    where: "San Francisco, CA",
    note: "Diligence and unit economics on 10+ Southeast Asian ventures.",
  },
  {
    org: "Microsoft",
    role: "Strategy & Product Consultant",
    when: "2023",
    where: "Microsoft Loop",
    note: "Market research informing the Loop product roadmap.",
  },
  {
    org: "Ministry of Finance, Sri Lanka",
    role: "Financial Policy Research Analyst",
    when: "2022",
    where: "Colombo",
    note: "Advised the Minister through a sovereign default and IMF talks.",
  },
  {
    org: "UC Berkeley",
    role: "B.A. Economics & Data Science",
    when: "2021–2024",
    where: "Berkeley, CA",
    note: "Two majors in 2.5 years. CFA Level I candidate.",
  },
];
