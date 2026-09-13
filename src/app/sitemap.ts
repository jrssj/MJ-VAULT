import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { publicEnv } from "@/lib/env";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const [products,categories] = await Promise.all([getProducts({limit:1000}),getCategories()]); const staticPaths = ["","/tienda","/nosotros","/contacto","/preguntas-frecuentes","/envios","/cambios-devoluciones","/privacidad","/terminos"]; return [...staticPaths.map((path) => ({ url: `${publicEnv.siteUrl}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : .6 })), ...products.map((p) => ({ url: `${publicEnv.siteUrl}/producto/${p.slug}`, lastModified: p.updated_at, changeFrequency: "weekly" as const, priority: .8 })), ...categories.map((c) => ({ url: `${publicEnv.siteUrl}/categoria/${c.slug}`, changeFrequency: "weekly" as const, priority: .7 }))]; }
