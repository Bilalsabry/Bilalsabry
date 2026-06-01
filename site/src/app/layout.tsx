import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";

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
  title: "Bilal Sabry — Builder · Operator · Thinker",
  description:
    "Founder & engineer building Krux AI. Strategy and finance operator who scaled a pharma CDMO 48% YoY. Advised a sovereign government through default. Berkeley Econ + Data Science in 2.5 years.",
  metadataBase: new URL("https://bilalsabry.com"),
  openGraph: {
    title: "Bilal Sabry",
    description: "Builder · Operator · Thinker",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${serif.variable} antialiased`}
    >
      <body className="grain">
        <Cursor />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
