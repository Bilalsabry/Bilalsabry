// ---------------------------------------------------------------------------
// All site copy. Short on purpose.
// ---------------------------------------------------------------------------

export const profile = {
  name: "Bilal Sabry",
  location: "New York, NY",
  timeZone: "America/New_York",
  email: "bilal@berkeley.edu",
  phone: "+16096335975", // only inside the downloadable contact card, never shown on the page
  links: {
    linkedin: "https://linkedin.com/in/bilal-sabry",
  },
  // One line under the name. The italic part is set in serif.
  intro: {
    lead: "Building",
    italic: "and learning.",
  },
};

export type Row = {
  id: string;
  title: string;
  note?: string;
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
        note: "Open-source research assistant in Rust.",
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
        note: "Strategy and finance in pharma.",
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
        href: "https://www.berkeley.edu",
      },
      {
        id: "royal",
        title: "Royal College",
        href: "https://royalcollege.lk",
      },
    ],
  },
];
