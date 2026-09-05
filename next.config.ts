import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The cPanel deploy host is memory-constrained and shared with other
  // tenants; a `next build` was observed spawning one worker per detected
  // CPU (31, on that host) for static generation, each with its own V8
  // heap, which reliably crashed the build with an OOM allocation failure.
  // This app has well under 100 routes, so setting
  // staticGenerationMinPagesPerWorker above that count keeps generation to
  // a single worker, trading build parallelism for a much lower peak
  // memory footprint.
  experimental: {
    staticGenerationMinPagesPerWorker: 1000,
  },
};

export default nextConfig;
