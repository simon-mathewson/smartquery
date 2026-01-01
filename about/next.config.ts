import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Static build
  output: "export",
  images: { unoptimized: true },

  transpilePackages: ["smartquery-shared"],

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "~": path.resolve(__dirname, "."),
      "@": path.resolve(__dirname, "../shared"),
    };

    return config;
  },
};

export default nextConfig;
