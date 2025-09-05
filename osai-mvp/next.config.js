/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'osai-seven.vercel.app' }],
        destination: 'https://www.osai.llc/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
