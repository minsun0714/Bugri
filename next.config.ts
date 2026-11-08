import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Demo history fixtures are on in the product build; E2E sets "0" and seeds its own records.
    NEXT_PUBLIC_DEMO_HISTORY:
      process.env.NEXT_PUBLIC_DEMO_HISTORY ?? "1",
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
