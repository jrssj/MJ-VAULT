import type { Product } from "@/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <div className="border-y hairline py-16 text-center"><p className="display text-3xl">No hay productos para mostrar</p><p className="muted mt-2 text-sm">Vuelve pronto o prueba otros filtros.</p></div>;
  return <div className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
