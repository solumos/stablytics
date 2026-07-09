import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Logo/icon assets are effectively immutable but not content-hashed;
        // without this they ship max-age=0 and repeat visitors revalidate
        // hundreds of images per page view.
        source: "/:dir(company-logos|chains|issuers|protocols|logos)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
