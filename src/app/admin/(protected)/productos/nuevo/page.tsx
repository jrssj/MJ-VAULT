import { getCategories } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
export default async function NewProductPage({ searchParams }:{searchParams:Promise<{error?:string}>}) { const [categories,params]=await Promise.all([getCategories(true),searchParams]); return <><p className="eyebrow text-[var(--gold)]">Catálogo</p><h1 className="display mb-8 mt-2 text-5xl">Nuevo producto</h1><ProductForm categories={categories} error={params.error}/></>; }
