import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSettings } from "@/lib/data";
import { publicEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/format";
import { offerCollections } from "@/lib/offers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ofertas por encargo | MJ Vault Importaciones MX",
  description: "Tenis Adidas y New Balance, calendarios de Adviento y regalos. Precios en MXN y atención por WhatsApp para confirmar tu talla y disponibilidad.",
};

export default async function OffersPage() {
  const settings = await getSettings();
  const whatsapp = (settings?.whatsapp_number || publicEnv.whatsappNumber || "").replace(/\D/g, "");

  return (
    <main>
      <section className="bg-[#542632] text-[#fffaf1]">
        <div className="container-page py-16 md:py-24">
          <p className="eyebrow text-[var(--gold-soft)]">MJ Vault · Importaciones MX</p>
          <h1 className="display mt-5 max-w-3xl text-6xl leading-none md:text-8xl">Hallazgos que vas a querer.</h1>
          <p className="mt-6 max-w-xl leading-7 text-white/80">Ofertas y novedades seleccionadas en Estados Unidos. Elige tu favorito y consulta disponibilidad para encargarlo.</p>
          <nav aria-label="Colecciones de ofertas" className="mt-8 flex flex-wrap gap-3">
            {offerCollections.map((collection) => <a key={collection.id} href={`#${collection.id}`} className="border border-white/35 px-5 py-3 text-sm hover:bg-white/10">{collection.title}</a>)}
          </nav>
          <p className="mt-7 text-xs leading-5 text-white/65">Precios publicados el 17 de noviembre de 2026, en pesos mexicanos. Confirmamos vigencia, talla, color y entrega por WhatsApp antes de tomar tu pedido. Imágenes de referencia. Confirma con Majo el modelo, color y diseño exactos.</p>
        </div>
      </section>

      <div className="container-page py-12 md:py-20">
        {offerCollections.map((collection) => (
          <section key={collection.id} id={collection.id} className="mb-16 scroll-mt-28" aria-labelledby={`${collection.id}-title`}>
            <h2 id={`${collection.id}-title`} className="display mb-7 text-4xl md:text-5xl">{collection.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collection.offers.map((offer) => {
                const message = `Hola, Majo. Me interesa ${offer.name}, publicado en ${formatCurrency(offer.price)}. ¿Me confirmas precio vigente, disponibilidad, talla o color, y entrega?`;
                const href = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : "/contacto";
                return (
                  <article key={offer.name} className="flex flex-col border hairline bg-[var(--paper)] p-6">
                    {offer.image && <div className="relative mb-5 aspect-[4/3]"><Image src={offer.image} alt={offer.name} fill sizes="(max-width: 640px) 90vw, 33vw" className="object-contain" /></div>}
                    <h3 className="text-lg font-semibold leading-6">{offer.name}</h3>
                    <p className="muted mt-2 text-sm">{offer.detail}</p>
                    <p className="mt-5 text-2xl font-semibold text-[#702c3b]">{formatCurrency(offer.price)}</p>
                    <a href={href} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noopener noreferrer" : undefined} className="mt-6 inline-flex min-h-12 items-center justify-between gap-3 border-t hairline pt-4 text-sm font-semibold hover:text-[var(--gold)]">Consultar disponibilidad <ArrowUpRight size={18} aria-hidden="true" /></a>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
        <div className="border-t hairline pt-8 text-sm leading-7 muted">
          <p>La disponibilidad depende de la tienda de origen y puede cambiar. Majo confirma el total, anticipo y condiciones de entrega antes de comprar.</p>
          <Link href="/tienda" className="mt-4 inline-block font-semibold text-[var(--ink)] underline underline-offset-4">Explorar también la tienda</Link>
        </div>
      </div>
    </main>
  );
}
