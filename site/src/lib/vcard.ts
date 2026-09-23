import { profile } from "./data";

/** Builds a vCard 3.0 (the version iOS and Android both import cleanly). */
export function buildVCard(): string {
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${profile.name}`,
    `EMAIL;TYPE=INTERNET:${profile.email}`,
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : "",
    `URL:https://bilalsabry.com`,
    `X-SOCIALPROFILE;TYPE=linkedin:${profile.links.linkedin}`,
    `ADR;TYPE=HOME:;;;${profile.location.split(",")[0].trim()};${profile.location.split(",")[1]?.trim() ?? ""};;`,
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n") + "\r\n";
}

/** Triggers a .vcf download in the browser. */
export function downloadVCard() {
  const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.name.replace(/\s+/g, "-")}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
