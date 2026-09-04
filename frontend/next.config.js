/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Preserves standard Next.js output for Vercel; enables standalone only when explicitly requested
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
};

module.exports = nextConfig;
