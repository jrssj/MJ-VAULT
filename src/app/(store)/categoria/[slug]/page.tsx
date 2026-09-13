import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/store/product-grid";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const category = (await getCategories()).find((item) => item.slug === slug); return { title: category?.name ?? "Categoría", description: category?.description ?? undefined }; }
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const [categories, products] = await Promise.all([getCategories(), getProducts({ category: slug, limit: 200 })]); const category = categories.find((item) => item.slug === slug); if (!category && categories.length) notFound(); return <main className="container-page py-10 md:py-16"><p className="eyebrow text-[var(--gold)]">Colección</p><h1 className="display mt-2 text-5xl md:text-6xl">{category?.name ?? slug.replaceAll("-", " ")}</h1>{category?.description && <p className="muted mt-3 max-w-xl">{category.description}</p>}<div className="mt-10"><ProductGrid products={products}/></div></main>; }
