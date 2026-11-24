/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.0.186'],
  reactCompiler: true,
  transpilePackages: ['react-icons'],
  outputFileTracingRoot: process.cwd(),
  images: {
    qualities: [75, 80, 95, 100],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
};

export default nextConfig;
