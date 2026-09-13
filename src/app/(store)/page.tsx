import Image from "next/image";
import Link from "next/link";
import { Headphones, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { ProductGrid } from "@/components/store/product-grid";

export const dynamic = "force-dynamic";

function getCategoryBanner(slug: string, index: number, customUrl?: string | null): string {
  if (customUrl && !customUrl.includes("/catalog/")) return customUrl;
  if (slug.includes("belleza") || slug.includes("beauty")) return "/editorial/category-beauty.jpg";
  if (slug.includes("cuidado") || slug.includes("personal") || slug.includes("care") || slug.includes("skin")) {
    return "/editorial/category-selfcare.jpg";
  }
  return index % 2 === 0 ? "/editorial/category-beauty.jpg" : "/editorial/category-selfcare.jpg";
}

export default async function HomePage() {
  const [newProducts, featured, categories, settings] = await Promise.all([
    getProducts({ isNew: true, limit: 8 }),
    getProducts({ featured: true, limit: 8 }),
    getCategories(),
    getSettings(),
  ]);

  const heroImage = settings?.hero_image_url || "/editorial/hero-luxury.jpg";

  const displayCategories = categories.length
    ? categories.slice(0, 4)
    : [
        { id: "1", slug: "belleza", name: "Belleza", active: true, sort_order: 1, created_at: "", updated_at: "", image_url: null, parent_id: null, description: null },
        { id: "2", slug: "cuidado-personal", name: "Cuidado personal", active: true, sort_order: 2, created_at: "", updated_at: "", image_url: null, parent_id: null, description: null },
      ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[82svh] overflow-hidden bg-[#12110f] text-white">
        <Image
          src={heroImage}
          alt="Selección de MJ Vault"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_25%] opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="container-page relative flex min-h-[82svh] items-end pb-16 md:items-center md:pb-0">
          <div className="max-w-2xl">
            <p className="eyebrow mb-5 text-[var(--gold-soft)] tracking-[0.2em]">
              MJ Vault · Boutique Internacional
            </p>
            <h1 className="display text-6xl leading-[.92] sm:text-7xl md:text-8xl">
              {settings?.hero_title ?? "Más que moda, tu esencia."}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/85">
              {settings?.hero_subtitle ?? "Descubre piezas y fórmulas seleccionadas para expresar tu estilo único."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="button-dark bg-white text-black hover:bg-[var(--gold-soft)] hover:text-black transition-colors" href="/tienda">
                Ver colección
              </Link>
              <Link className="button-secondary border-white/80 text-white hover:bg-white hover:text-black transition-colors" href="/tienda?new=true">
                Nuevos ingresos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Seleccionadas */}
      <section className="container-page py-16 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow text-[var(--gold)]">Explora</p>
            <h2 className="display mt-2 text-4xl md:text-5xl">Categorías seleccionadas</h2>
          </div>
          <Link href="/tienda" className="hidden text-xs font-bold uppercase tracking-[.14em] hover:text-[var(--gold)] md:block">
            Ver todo el catálogo
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {displayCategories.map((category, index) => (
            <Link
              href={`/categoria/${category.slug}`}
              key={category.slug}
              className="group relative aspect-[16/10] overflow-hidden bg-[#171512] shadow-sm"
            >
              <Image
                src={getCategoryBanner(category.slug, index, category.image_url)}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity group-hover:from-black/85" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="eyebrow text-xs uppercase tracking-[0.16em] text-[var(--gold-soft)]">
                  Colección exclusiva
                </span>
                <h3 className="display mt-1 text-4xl text-white sm:text-5xl">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recién Llegados */}
      <section className="container-page pb-16 md:pb-24">
        <div className="mb-8">
          <p className="eyebrow text-[var(--gold)]">Recién llegados</p>
          <h2 className="display mt-2 text-4xl md:text-5xl">Nuevos ingresos</h2>
          <p className="muted mt-3 text-sm">Piezas y formulaciones que llegan para convertirse en tus favoritas.</p>
        </div>
        <ProductGrid products={newProducts} />
      </section>

      {/* Editorial Collection Banner */}
      <section className="bg-[#171512] text-white">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[460px] md:min-h-[580px]">
            <Image
              src="/editorial/collection-lifestyle.jpg"
              alt="La colección de MJ Vault"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
          <div className="flex items-center px-7 py-16 md:px-16">
            <div className="max-w-lg">
              <p className="eyebrow text-[var(--gold-soft)] tracking-[0.16em]">La colección</p>
              <h2 className="display mt-4 text-5xl md:text-6xl">Tu estilo. Tu esencia. Tu Vault.</h2>
              <p className="mt-5 leading-7 text-white/75">
                Una selección cuidada para acompañar la forma única en que eliges verte y sentirte. Atención personalizada y envíos seguros a Estados Unidos, México y Colombia.
              </p>
              <Link className="button-dark mt-8 inline-block bg-white text-black hover:bg-[var(--gold-soft)]" href="/tienda">
                Descubrir colección
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Selección Destacada */}
      <section className="container-page py-16 md:py-24">
        <div className="mb-8">
          <p className="eyebrow text-[var(--gold)]">Selección MJ</p>
          <h2 className="display mt-2 text-4xl md:text-5xl">Productos destacados</h2>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* Ventajas y Garantías */}
      <section className="border-y hairline bg-[var(--paper)]">
        <div className="container-page grid grid-cols-2 gap-px py-10 md:grid-cols-4">
          {[
            [PackageCheck, "Compra fácil", "Selecciona y confirma tu orden vía WhatsApp."],
            [Headphones, "Atención personal", "Acompañamiento VIP antes y después de tu compra."],
            [Sparkles, "Selección cuidada", "Piezas y cosméticos elegidos con intención."],
            [ShieldCheck, "Envíos internacionales", "Despachos a Estados Unidos, México y Colombia."],
          ].map(([Icon, title, copy]) => {
            const C = Icon as typeof PackageCheck;
            return (
              <div key={String(title)} className="px-4 py-6 text-center">
                <C className="mx-auto text-[var(--gold)]" strokeWidth={1.25} size={28} />
                <h3 className="mt-4 text-sm font-bold">{String(title)}</h3>
                <p className="muted mx-auto mt-2 max-w-[220px] text-xs leading-5">{String(copy)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
