import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

export const nextConfig: NextConfig = {
  output: "export",
  cacheComponents: false,
  partialPrefetching: false,
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withContentCollections(nextConfig);
