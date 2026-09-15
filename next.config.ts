import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from GitHub avatars / og images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
    ],
  },
};

export default nextConfig;
