/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;
