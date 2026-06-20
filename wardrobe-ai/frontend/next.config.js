/** @type {import('next').NextConfig} */
const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api';
const backendOrigin = backendApiUrl.replace(/\/api\/?$/, '') || 'http://localhost:3001';

function buildImageRemotePatterns() {
  const patterns = [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '3001',
      pathname: '/uploads/**',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '3001',
      pathname: '/uploads/**',
    },
  ];

  try {
    const backendUrl = new URL(backendOrigin);
    const protocol = backendUrl.protocol.replace(':', '');
    const isLocal =
      backendUrl.hostname === 'localhost' || backendUrl.hostname === '127.0.0.1';

    if (!isLocal || backendUrl.port !== '3001') {
      patterns.push({
        protocol,
        hostname: backendUrl.hostname,
        ...(backendUrl.port ? { port: backendUrl.port } : {}),
        pathname: '/uploads/**',
      });
    }
  } catch {
    // Keep default localhost patterns when BACKEND_API_URL is invalid.
  }

  return patterns;
}

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    remotePatterns: buildImageRemotePatterns(),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
