/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: 'attachment',
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
