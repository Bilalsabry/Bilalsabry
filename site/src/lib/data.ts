// ---------------------------------------------------------------------------
// Site content. All copy lives here so it's trivial to edit.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Bilal Sabry",
  greeting: "Hi, I’m Bilal",
  roles: ["Founder", "Engineer", "Operator", "Strategist"],
  location: "Princeton, NJ",
  email: "bilal@berkeley.edu",
  links: {
    linkedin: "https://linkedin.com/in/bilal-sabry",
    github: "https://github.com/Bilalsabry",
    krux: "https://krux.bio",
  },
  // Short hero tagline, famous-personal-site voice.
  thesis:
    "I build companies — and the software that runs them. I’m happiest in the overlap between the code, the deal, and the room where strategy gets set.",
};

// Short lines that cycle through the Remotion hero as a "facts ticker".
export const facts = [
  "Founder & engineer — Krux AI",
  "Production AI, shipped in Rust",
  "Advised a government through a sovereign default",
  "Economics × Data Science, UC Berkeley",
];

export const manifesto = [
  "I’m a builder who never picked a lane.",
  "I write production software, I run the numbers that decide whether a business lives,",
  "and I sit in the rooms where the strategy gets set.",
  "The throughline is leverage —",
  "find the one decision that moves everything, then build the system that makes it repeatable.",
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
    value: "$2.9B",
    target: 2.9,
    prefix: "$",
    suffix: "B",
    label: "Sovereign bailout modeled",
    sub: "Built the fiscal scenarios used in live IMF negotiations for Sri Lanka.",
  },
  {
    value: "25h",
    target: 25,
    suffix: "h→min",
    label: "RFP cycle, compressed",
    sub: "The pharma proposal process Krux AI turns from a day into minutes.",
  },
  {
    value: "2.5 yrs",
    target: 2.5,
    suffix: " yrs",
    label: "To a double Berkeley degree",
    sub: "B.A. Economics & Data Science — two majors, half the time.",
  },
  {
    value: "21",
    target: 21,
    label: "At the UN General Assembly",
    sub: "Delegate with the Sri Lankan Mission; researcher to the Foreign Minister.",
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
      "My company. It turns a day-long, 300-page RFP response into a regulator-grade proposal in minutes. I built the whole product surface — scoped retrieval, a compliance-matrix extractor, a versioned answer library, and a tamper-evident audit export — and I run the strategy, the customer development, and the raise.",
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
      "The sole strategy-and-finance resource for a high-growth pharmaceutical CDMO, working directly with the CEO. I owned M&A, capital strategy, contract architecture, and board reporting — and led an operational turnaround that re-rated the business from a services shop toward a vertical-SaaS profile. Built the FP&A function from scratch and drove a company-wide SAP go-live.",
    stack: ["M&A", "Capital strategy", "FP&A from scratch", "SAP go-live"],
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
    body: "I run the numbers that decide whether a business lives — M&A, FP&A, deal structuring, restructuring. I’ve sat with a CEO and turned a services shop into a growth story, and I’ve lived in the board deck.",
    tags: ["M&A", "Capital strategy", "FP&A", "Operational restructuring"],
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
    note: "Reporting to the CEO — strategy, finance, M&A, and an operational turnaround.",
  },
  {
    org: "Patamar Capital",
    role: "Impact VC Intern",
    when: "2023",
    where: "San Francisco, CA",
    note: "Diligence and unit economics across early-stage Southeast Asian ventures.",
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
