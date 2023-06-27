/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['github.com'],
  },
  env: {
    CONTRACT_IDENTITY: process.env.CONTRACT_IDENTITY,
    CONTRACT_ADDRESS_BOOK: process.env.CONTRACT_ADDRESS_BOOK,
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
