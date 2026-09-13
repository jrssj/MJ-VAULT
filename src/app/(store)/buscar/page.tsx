import { getProducts } from "@/lib/data";
import { LiveSearch } from "@/components/store/live-search";

export const dynamic = "force-dynamic";
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) { const q = (await searchParams).q?.trim() ?? ""; const products = q.length >= 2 ? await getProducts({ query: q, limit: 24 }) : []; return <main className="container-page py-12 md:py-16"><p className="eyebrow text-[var(--gold)]">Encuentra tu favorito</p><h1 className="display mt-2 text-5xl">Buscar</h1><LiveSearch initialQuery={q} initialProducts={products}/></main>; }
