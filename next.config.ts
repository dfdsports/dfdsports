import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
    ];
  },
};

export default nextConfig;
