import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages (served at root: bilalsabry.github.io)
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
