import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import Terminal from "@/components/Terminal";
import Toast from "@/components/Toast";
import { profile } from "@/lib/data";

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
  title: "Bilal Sabry — Founder & Engineer",
  description:
    "I build companies, and the software that runs them. Founder of Krux AI. Previously strategy & finance for a pharma CDMO and policy research for Sri Lanka’s Minister of Finance. UC Berkeley, Economics & Data Science.",
  metadataBase: new URL("https://bilalsabry.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Bilal Sabry",
    description: "I build companies, and the software that runs them.",
    type: "website",
    url: "https://bilalsabry.com",
    siteName: "Bilal Sabry",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bilal Sabry",
    description: "I build companies, and the software that runs them.",
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
  jobTitle: "Founder & Engineer",
  worksFor: { "@type": "Organization", name: "Krux AI", url: profile.links.krux },
  alumniOf: { "@type": "CollegeOrUniversity", name: "UC Berkeley" },
  address: { "@type": "PostalAddress", addressLocality: "Princeton", addressRegion: "NJ" },
  sameAs: [profile.links.linkedin, profile.links.github],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${serif.variable} antialiased`}
    >
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
