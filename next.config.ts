import type { NextConfig } from "next";

type RemoteImagePattern = Exclude<NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number], URL>;

const scriptSource = process.env.NODE_ENV === "production"
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

function neonPublicImagePattern(): RemoteImagePattern | undefined {
  const endpoint = process.env.NEON_OBJECT_STORAGE_ENDPOINT;
  const bucket = process.env.NEON_OBJECT_STORAGE_PUBLIC_BUCKET;
  if (!endpoint || !bucket) return undefined;

  try {
    const url = new URL(endpoint);
    return {
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      port: url.port,
      pathname: `${url.pathname.replace(/\/$/, "")}/${bucket}/**`,
    };
  } catch {
    return undefined;
  }
}

const neonImagePattern = neonPublicImagePattern();

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Public uploads are served from the configured Neon Object Storage bucket.
    // This lets next/image optimize them on storefront pages as well as in admin.
    remotePatterns: neonImagePattern ? [neonImagePattern] : [],
  },
  experimental: { serverActions: { bodySizeLimit: "48mb" } },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; ${scriptSource}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; frame-src https://www.youtube-nocookie.com; connect-src 'self' https:; upgrade-insecure-requests` },
      ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
