import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// The browser talks to /api/backend on the same origin; the route handler at
// app/api/backend/[...path]/route.ts proxies to BACKEND_ORIGIN server-side, so
// there are no cross-origin CORS/private-network problems with the LAN backend.
const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
