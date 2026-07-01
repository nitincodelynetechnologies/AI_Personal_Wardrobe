const path = require('path');

const nextCacheDir = process.env.NEXT_DIST_DIR || 'node_modules/.cache/wardrobe-next';

/** @type {import('next').NextConfig} */
const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api';
const backendOrigin = backendApiUrl.replace(/\/api\/?$/, '') || 'http://localhost:3001';
const vtonBackendUrl = process.env.VTON_BACKEND_URL || 'http://127.0.0.1:8010';

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
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      pathname: '/**',
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
  outputFileTracingRoot: path.join(__dirname),
  distDir: nextCacheDir,
  reactStrictMode: true,
  transpilePackages: ['three'],
  // IDM-VTON via /vton-api rewrite can take several minutes
  experimental: {
    proxyTimeout: 300000,
  },
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
      {
        source: '/vton-api/:path*',
        destination: `${vtonBackendUrl}/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    config.output = {
      ...config.output,
      // OneDrive + large Three.js chunks can exceed the default dev timeout.
      chunkLoadTimeout: 120000,
    };

    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    position: 'bottom-right',
  },
};

module.exports = nextConfig;
