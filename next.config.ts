import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NHOST_SUBDOMAIN: process.env.NHOST_SUBDOMAIN,
    NHOST_REGION: process.env.NHOST_REGION,
    NEXT_PUBLIC_CLIENT_APP_URL: process.env.NEXT_PUBLIC_CLIENT_APP_URL,
  },
};

export default nextConfig;
