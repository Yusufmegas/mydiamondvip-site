import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

const IMMUTABLE = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  experimental: {
    serverActions: {
      // Uygulama kuralı 20 MB dosya; multipart ek yükü için pay bırakılır.
      // Sınırsız YAPMAYIN — DoS yüzeyi açar.
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    // /codec ve /fallback immutable — unutulursa CDN her Range isteğini
    // origin'e revalidate eder → stall patlaması (spec §1.6)
    return [
      {
        source: "/codec/:path*",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/fallback/:path*",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/poster.webp",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
