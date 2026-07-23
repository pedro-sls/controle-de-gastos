import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

function getLocalDevOrigins() {
  const addresses = Object.values(networkInterfaces())
    .flatMap((network) => network ?? [])
    .filter(
      ({ address, family, internal }) =>
        family === "IPv4" && !internal && address,
    )
    .map(({ address }) => address);

  return ["localhost", "127.0.0.1", ...new Set(addresses)];
}

const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co${isDevelopment ? " http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
  logging: {
    serverFunctions: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
