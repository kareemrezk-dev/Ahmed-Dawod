import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/", "/favicon"],
      },
    ],
    sitemap: "https://ahmeddawod.com/sitemap.xml",
    host: "https://ahmeddawod.com",
  };
}
