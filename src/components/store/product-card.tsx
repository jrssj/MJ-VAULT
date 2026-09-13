"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { availableStock } from "@/lib/data-client";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";
import { useCart } from "./cart-provider";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart(); const images = product.images ?? []; const primary = images.find((image) => image.is_primary) ?? images[0]; const secondary = images.find((image) => image.id !== primary?.id); const stock = availableStock(product); const canQuickAdd = stock > 0 && !(product.variants?.length);
  return <article className="group min-w-0"><Link href={`/producto/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-white"><div className="absolute left-3 top-3 z-10 flex gap-2">{product.is_new && <span className="pill">Nuevo</span>}{product.on_sale && <span className="pill bg-[var(--gold)]">Oferta</span>}</div>{stock === 0 && <span className="absolute inset-x-0 bottom-0 z-10 bg-white/90 px-3 py-2 text-center text-xs font-bold uppercase tracking-[.14em]">Agotado</span>}{primary ? <Image src={primary.image_url} alt={primary.alt_text ?? product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className={`object-cover object-top transition duration-500 ${secondary ? "group-hover:opacity-0" : "group-hover:scale-[1.02]"}`} /> : <div className="grid h-full place-items-center text-sm text-[var(--muted)]">Sin imagen</div>}{secondary && <Image src={secondary.image_url} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}</Link><div className="flex items-start justify-between gap-3 pt-3"><div><p className="text-[13px] uppercase tracking-[.08em] text-[var(--muted)]">{product.category?.name ?? "MJ Vault"}</p><Link href={`/producto/${product.slug}`} className="mt-1 block text-sm font-semibold leading-snug md:text-[15px]">{product.name}</Link><div className="mt-2 flex gap-2 text-sm"><span>{formatCurrency(product.price)}</span>{product.compare_at_price && <span className="text-[var(--muted)] line-through">{formatCurrency(product.compare_at_price)}</span>}</div></div>{canQuickAdd && <button onClick={() => addItem({ productId: product.id, variantId: null, slug: product.slug, name: product.name, image: primary?.image_url ?? null, price: product.price, quantity: 1, size: null, color: null, maxStock: stock })} className="mt-1 border hairline p-2 transition hover:border-[var(--gold)] hover:text-[var(--gold)]" aria-label={`Agregar ${product.name} al carrito`}><ShoppingBag size={17} /></button>}</div></article>;
}
