import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The cPanel deploy host is memory-constrained and shared with other
  // tenants; without this, `next build`'s getNumberOfWorkers() (see
  // node_modules/next/dist/build/index.js) falls back to a CPU-count-based
  // default, spawning one worker process per detected CPU (31, on that
  // host) for page-data collection and static generation, each with its
  // own V8 heap — this reliably crashed the build with an OOM allocation
  // failure. Pinning experimental.cpus to 1 keeps the build to a single
  // worker, trading build parallelism for a much lower peak memory
  // footprint.
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
