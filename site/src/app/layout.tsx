import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import Terminal from "@/components/Terminal";
import Toast from "@/components/Toast";
import { profile } from "@/lib/data";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bilal Sabry",
  description:
    "Building and learning. Strategic Projects & Finance Lead at TCG GreenChem; building Krux and Clerq AI. UC Berkeley Economics.",
  metadataBase: new URL("https://bilalsabry.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Bilal Sabry",
    description: "Building and learning.",
    type: "website",
    url: "https://bilalsabry.com",
    siteName: "Bilal Sabry",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bilal Sabry",
    description: "Building and learning.",
  },
  robots: { index: true, follow: true },
};

// Structured data so search engines show a proper person card for the domain.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: "https://bilalsabry.com",
  email: `mailto:${profile.email}`,
  jobTitle: "Strategic Projects & Finance Lead",
  worksFor: { "@type": "Organization", name: "TCG GreenChem" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "UC Berkeley" },
  address: { "@type": "PostalAddress", addressLocality: "New York", addressRegion: "NY" },
  sameAs: [profile.links.linkedin],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${serif.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <CommandPalette />
        <Terminal />
        <Toast />
      </body>
    </html>
  );
}
