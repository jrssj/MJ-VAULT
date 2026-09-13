import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
export default function robots(): MetadataRoute.Robots { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/checkout/"] }], sitemap: `${publicEnv.siteUrl}/sitemap.xml` }; }
