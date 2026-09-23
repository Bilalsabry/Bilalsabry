// ---------------------------------------------------------------------------
// All site copy. Short on purpose.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Bilal Sabry",
  location: "New York, NY",
  timeZone: "America/New_York",
  email: "bilal@berkeley.edu",
  links: {
    linkedin: "https://linkedin.com/in/bilal-sabry",
    github: "https://github.com/Bilalsabry",
  },
  // One line under the name. The italic part is set in serif.
  intro: {
    lead: "Finance, strategy, AI,",
    italic: "and everything in between.",
  },
};

export type Row = {
  id: string;
  title: string;
  note: string;
  href?: string;
};

export type Section = {
  id: string;
  label: string;
  rows: Row[];
};

export const sections: Section[] = [
  {
    id: "building",
    label: "Building",
    rows: [
      {
        id: "krux",
        title: "Krux",
        note: "AI proposal and costing workflows for pharma manufacturing.",
        href: "https://krux.bio",
      },
      {
        id: "clerqai",
        title: "Clerq AI",
        note: "Legal document automation for law firms in Sri Lanka. A client’s filing in, a filable draft out.",
        href: "https://www.clerqai.org/",
      },
      {
        id: "evidence",
        title: "evidence",
        note: "Open-source research assistant in Rust. Local-first, every answer cited.",
        href: "https://github.com/Bilalsabry/evidence",
      },
    ],
  },
  {
    id: "now",
    label: "Now",
    rows: [
      {
        id: "tcg",
        title: "TCG GreenChem",
        note: "Strategic Projects & Finance Lead, reporting to the CEO. Princeton, NJ.",
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    rows: [
      {
        id: "berkeley",
        title: "UC Berkeley",
        note: "B.A. Economics, minor in Data Science. Class of 2024.",
      },
    ],
  },
];
