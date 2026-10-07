import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preview / Forwarded Ports در Cursor Cloud Agent
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.cursor.sh",
    "*.cursor.com",
    "*.cursorusercontent.com",
    "*.gitpod.dev",
  ],
};

export default nextConfig;
