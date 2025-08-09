
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this block to disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

export default nextConfig;
