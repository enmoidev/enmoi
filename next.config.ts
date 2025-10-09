import type { NextConfig } from "next";

const betterAuthURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "";
const isProd = process.env.NODE_ENV === "production";

// const awsRegion = process.env.AWS_REGION || "eu-west-3";
// const awsBucket = process.env.AWS_S3_BUCKET_NAME || "";
// const s3BaseURL = `https://${awsBucket}.s3.${awsRegion}.amazonaws.com`;

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
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: blob:; /* ${/* ${s3BaseURL} */ ""} */
              connect-src *;
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
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: `${awsBucket}.s3.${awsRegion}.amazonaws.com`,
  //     },
  //   ],
  // },
};

export default nextConfig;
