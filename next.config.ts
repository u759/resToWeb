import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    // Other experimental flags can go here if needed
  },
};

export default nextConfig;
