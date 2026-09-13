import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/types";
export default async function EditProductPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;saved?:string}>}) { const [{id},query,categories]=await Promise.all([params,searchParams,getCategories(true)]); const {supabase}=await requireAdmin(); const {data}=await supabase.from("products").select("*, category:categories(*), images:product_images(*), variants:product_variants(*)").eq("id",id).single(); if(!data)notFound(); const product=data as unknown as Product; product.images=(product.images??[]).sort((a,b)=>a.sort_order-b.sort_order); return <><p className="eyebrow text-[var(--gold)]">Catálogo</p><h1 className="display mb-8 mt-2 text-5xl">Editar producto</h1><ProductForm product={product} categories={categories} error={query.error} saved={query.saved==="true"}/></>; }
