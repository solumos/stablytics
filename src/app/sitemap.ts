import type { MetadataRoute } from "next";
import { companies } from "@/data/companies";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/companies`, lastModified, changeFrequency: "daily", priority: 0.9 },
  ];

  const companyRoutes: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${SITE_URL}/companies/${c.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...companyRoutes];
}
