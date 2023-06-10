/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {},
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
