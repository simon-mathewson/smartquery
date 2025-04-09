import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Static build
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
