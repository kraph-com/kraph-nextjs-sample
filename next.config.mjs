/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Kraph's per-instance Node sidecar deploy
  // (target=nextjs_service). Produces a self-contained server bundle
  // at .next/standalone/ that runs as `node server.js` with its own
  // bundled node_modules subset.
  output: "standalone",
};

export default nextConfig;
