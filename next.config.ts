import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache for optimized images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      // Redirect any stale /admin/dashboard bookmark → admin root
      {
        source: '/admin/dashboard',
        destination: '/admin',
        permanent: true,
      },
      // Redirect /collection to /collections
      {
        source: '/collection',
        destination: '/collections',
        permanent: true,
      },
      // Redirect removed admin sections to /admin
      {
        source: '/admin/why-choose-us',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/admin/highlights',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
