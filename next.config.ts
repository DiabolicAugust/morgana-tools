import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/tools/cbz-extract-images",
        destination: "/tools/cbz-to-pages-zip",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
