import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// The browser talks to /api/backend on the same origin; the route handler at
// app/api/backend/[...path]/route.ts proxies to BACKEND_ORIGIN server-side, so
// there are no cross-origin CORS/private-network problems with the LAN backend.
const nextConfig: NextConfig = {
  // Backend/plan docs call the seller cabinets /portal/advokat and
  // /portal/yurist; send those links to the real routes instead of a 404.
  async redirects() {
    return [
      { source: "/:locale(uz|ru|en)/portal/advokat/:path*", destination: "/:locale/portal/advocate/:path*", permanent: false },
      { source: "/:locale(uz|ru|en)/portal/yurist/:path*", destination: "/:locale/portal/lawyer/:path*", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
