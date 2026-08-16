import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/signals": ["./data/generated/signal-catalog.json", "./data/generated/evidence-universe.json"],
  },
};

export default nextConfig;
