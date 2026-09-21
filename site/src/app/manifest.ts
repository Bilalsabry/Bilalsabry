import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bilal Sabry",
    short_name: "Bilal",
    description: "Builder · Operator · Thinker",
    start_url: "/",
    display: "standalone",
    background_color: "#07080a",
    theme_color: "#07080a",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  };
}
