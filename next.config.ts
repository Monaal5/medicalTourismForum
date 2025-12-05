import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 Add this to enable static export
  // output: 'export', // Only for static export, not needed for Vercel deployment
  // basePath: '/your-base-path', // Uncomment and set if deploying to a subdirectory

  // 👇 Add this if you're using <Image /> component
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/**",
      },
    ],
  },

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },



  env: {
    SUPPRESS_HYDRATION_WARNING: "true",
  },
};

export default nextConfig;
