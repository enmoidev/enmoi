import type { NextConfig } from "next";

const betterAuthURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' ${betterAuthURL};
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: blob:;
              connect-src 'self' ${betterAuthURL} https://fonts.googleapis.com https://fonts.gstatic.com ${!isProd ? "http://localhost:3000" : ""};
              object-src 'none';
              base-uri 'self';
            `.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;