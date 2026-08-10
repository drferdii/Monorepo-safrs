import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    useTypeScriptCli: true,
  },
  transpilePackages: [
    "@safrs/api",
    "@safrs/database",
    "@safrs/env",
    "@safrs/schemas",
    "@safrs/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
