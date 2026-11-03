/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/docs',
        destination: '/api-docs',
      },
      {
        source: '/buy/upi',
        destination: '/api/buy/upi',
      },
      {
        source: '/buy/confirm-utr',
        destination: '/api/buy/confirm-utr',
      },
    ];
  },
};

module.exports = nextConfig;
