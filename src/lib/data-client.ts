import type { Product } from "@/types";
export function availableStock(product: Product) {
  return product.variants?.length ? product.variants.reduce((sum, variant) => sum + variant.stock, 0) : product.stock;
}
