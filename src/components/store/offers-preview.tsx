import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { offerCollections } from "@/lib/offers";

export function OffersPreview() {
  return (
    <section className="bg-[#f0e8dc]" aria-labelledby="offers-heading">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <p className="eyebrow text-[#702c3b]">Hallazgos de Estados Unidos</p>
          <h2 id="offers-heading" className="display mt-4 text-5xl text-[#542632] md:text-6xl">Tu próximo favorito está aquí.</h2>
          <p className="muted mt-5 max-w-md leading-7">Descubre los tenis y regalos seleccionados por Majo. Consulta tu talla y confirma tu encargo con atención personalizada.</p>
          <Link href="/ofertas" className="button-primary mt-7">Ver ofertas en MXN</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {offerCollections[0].offers.slice(0, 2).map((offer) => (
            <Link href="/ofertas#adidas" key={offer.name} className="group bg-[var(--paper)] p-4 md:p-6">
              <div className="relative aspect-square overflow-hidden">
                <Image src={offer.image!} alt={offer.name} fill sizes="(max-width: 768px) 45vw, 25vw" className="object-contain transition-transform group-hover:scale-105" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{offer.name}</h3>
              <p className="mt-2 font-semibold text-[#702c3b]">{formatCurrency(offer.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
