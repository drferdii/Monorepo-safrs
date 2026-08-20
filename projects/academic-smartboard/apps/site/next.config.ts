import type { NextConfig } from "next";

// Sengaja TANPA import "@safrs/env/server": static export tidak punya env server
// (rasional sama dengan projects/control-center/apps/web/next.config.ts).
// TANPA cacheComponents: fitur server-side, salah untuk output "export".
const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@sentra/token"],
  typedRoutes: true,
  images: { unoptimized: true },
};

export default nextConfig;
