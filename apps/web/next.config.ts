import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { defaultSecurityHeaders, getCspHeader } from "@nexpress/security";

const securityHeaders = [
  ...defaultSecurityHeaders,
  getCspHeader()
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@nexpress/builder-core', '@nexpress/builder-editor'],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default withPayload(nextConfig);
