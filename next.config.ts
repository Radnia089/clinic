import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // برای Preview / Forwarded Ports در Cursor
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
