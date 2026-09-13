import "server-only";
import { cache } from "react";
import { getOptionalClient } from "@/lib/supabase/server";
import type { Category, Product, StoreSettings } from "@/types";

const productSelect = "*, category:categories(*), images:product_images(*), variants:product_variants(*)";

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    images: [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    variants: (product.variants ?? []).filter((variant) => variant.active),
  };
}

export async function getProducts(options: {
  featured?: boolean;
  isNew?: boolean;
  category?: string;
  query?: string;
  limit?: number;
  includeInactive?: boolean;
} = {}): Promise<Product[]> {
  const supabase = await getOptionalClient();
  if (!supabase) return [];
  let query = supabase.from("products").select(productSelect);
  if (!options.includeInactive) query = query.eq("active", true);
  if (options.featured) query = query.eq("featured", true);
  if (options.isNew) query = query.eq("is_new", true);
  if (options.category) query = query.eq("category.slug", options.category);
  if (options.query) {
    const safe = options.query.replace(/[%_,()]/g, " ").trim();
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,sku.ilike.%${safe}%`);
  }
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 100);
  if (error) {
    console.error("No se pudo cargar el catálogo", error.code);
    return [];
  }
  return (data as unknown as Product[]).map(normalizeProduct);
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await getOptionalClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (error) return null;
  return normalizeProduct(data as unknown as Product);
});

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const supabase = await getOptionalClient();
  if (!supabase) return [];
  let query = supabase.from("categories").select("*");
  if (!includeInactive) query = query.eq("active", true);
  const { data } = await query.order("sort_order").order("name");
  return (data ?? []) as Category[];
}

export const getSettings = cache(async (): Promise<StoreSettings | null> => {
  const supabase = await getOptionalClient();
  if (!supabase) return null;
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single();
  return data as StoreSettings | null;
});

export function availableStock(product: Product) {
  if (product.variants?.length) {
    return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
  return product.stock;
}
