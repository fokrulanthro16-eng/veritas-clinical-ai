const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Restrict file tracing strictly to frontend directory
  experimental: {
    outputFileTracingRoot: path.join(__dirname),
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
