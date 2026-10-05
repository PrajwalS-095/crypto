import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [{ source: "/", destination: "/aim", permanent: false }];
  },
};

export default nextConfig;
