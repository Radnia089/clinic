import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-seo";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/contact", "/magazine", "/patient/book", "/patient/consult"],
      disallow: ["/clinic", "/login", "/preview", "/apps", "/api", "/patient"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
