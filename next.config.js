/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["github.com"]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/identity',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
