import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    inlineCss: true,
    exposeTestingApiInProductionBuild: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.gr-assets.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
