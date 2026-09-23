"use client";

import { useState } from "react";
import { profile } from "@/lib/data";
import { copyText } from "@/lib/actions";
import { downloadVCard } from "@/lib/vcard";
import { toast } from "./Toast";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const onEmailClick = async (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) return; // ⌘-click opens the mail client
    e.preventDefault();
    const ok = await copyText(profile.email);
    if (ok) {
      setCopied(true);
      toast("Email copied");
      setTimeout(() => setCopied(false), 1600);
    } else {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <footer id="contact" style={{ padding: "clamp(40px, 8vh, 88px) 0 40px" }}>
      <div className="wrap">
        <div
          className="rows-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "140px minmax(0, 1fr)",
            gap: "0 clamp(20px, 4vw, 48px)",
            alignItems: "baseline",
            borderTop: "1px solid var(--line)",
            paddingTop: 22,
          }}
        >
          <span className="label">Contact</span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 28px",
              fontSize: 16,
            }}
          >
            <a
              href={`mailto:${profile.email}`}
              onClick={onEmailClick}
              title="Click to copy · ⌘-click to open mail"
              className="link"
              style={{ color: "var(--fg)" }}
            >
              {profile.email}
              <span className="mono" style={{ marginLeft: 10, fontSize: 11, color: "var(--fg-3)" }}>
                {copied ? "copied" : "copy"}
              </span>
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="link">
              LinkedIn
            </a>
            <button
              type="button"
              onClick={() => {
                downloadVCard();
                toast("Contact card saved");
              }}
              className="link"
              style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}
              title="Download a contact card (.vcf)"
            >
              Save contact
            </button>
          </div>
        </div>

        <div
          className="mono no-print"
          style={{
            marginTop: "clamp(56px, 12vh, 120px)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 10,
            fontSize: 11.5,
            color: "var(--fg-3)",
          }}
        >
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>
            <kbd style={{ fontFamily: "inherit" }}>⌘K</kbd> · <kbd style={{ fontFamily: "inherit" }}>`</kbd>
          </span>
        </div>
      </div>
      <style>{`@media (max-width: 640px){ .rows-grid{ grid-template-columns: 1fr !important; } .rows-grid > .label{ margin-bottom: 10px; } }`}</style>
    </footer>
  );
}
