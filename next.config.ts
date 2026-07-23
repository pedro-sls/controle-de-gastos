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

function getSupabaseConnectSources() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!configuredUrl) {
    return ["https://*.supabase.co", "wss://*.supabase.co"];
  }

  try {
    const url = new URL(configuredUrl);
    const websocketUrl = new URL(url);
    websocketUrl.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    return [url.origin, websocketUrl.origin];
  } catch {
    return ["https://*.supabase.co", "wss://*.supabase.co"];
  }
}

const isDevelopment = process.env.NODE_ENV === "development";
const isHttpsDeployment =
  process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;
const deploymentVersion = process.env.DEPLOYMENT_VERSION?.trim();
const connectSources = [
  "'self'",
  ...getSupabaseConnectSources(),
  ...(isDevelopment
    ? [
        "http://127.0.0.1:*",
        "http://localhost:*",
        "ws://127.0.0.1:*",
        "ws://localhost:*",
      ]
    : []),
].join(" ");
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src ${connectSources}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttpsDeployment ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  deploymentId: deploymentVersion || undefined,
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
          ...(isHttpsDeployment
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
