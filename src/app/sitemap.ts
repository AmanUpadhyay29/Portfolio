import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { allWorks } from "@/lib/works";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string) => new URL(path, siteUrl()).toString();
  return [
    { url: at("/") },
    { url: at("/credits") },
    ...allWorks.map((w) => ({ url: at(`/work/${w.slug}`) })),
  ];
}
