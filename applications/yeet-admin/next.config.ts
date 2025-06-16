import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Enable CORS for the API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
