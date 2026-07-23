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

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
  logging: {
    serverFunctions: false,
  },
};

export default nextConfig;
