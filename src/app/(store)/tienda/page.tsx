import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { getCategories, getProducts } from "@/lib/data";
import { availableStock } from "@/lib/data-client";
import { ProductGrid } from "@/components/store/product-grid";
import type { Category } from "@/types";

export const metadata: Metadata = { title: "Tienda", description: "Explora el catálogo completo de MJ Vault." };
export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;
const value = (params: Params, key: string) => typeof params[key] === "string" ? params[key] as string : "";

function Filters({ params, categories, sizes, colors }: { params: Params; categories: Category[]; sizes: string[]; colors: string[] }) {
  return <form className="grid gap-5">
    <div><p className="mb-3 text-sm font-bold">Categoría</p><select name="category" className="input" defaultValue={value(params,"category")}><option value="">Todas</option>{categories.map(item=><option key={item.id} value={item.slug}>{item.name}</option>)}</select></div>
    <div><p className="mb-3 text-sm font-bold">Precio</p><div className="grid grid-cols-2 gap-2"><input className="input" name="min" type="number" min="0" placeholder="Mín." defaultValue={value(params,"min")} aria-label="Precio mínimo"/><input className="input" name="max" type="number" min="0" placeholder="Máx." defaultValue={value(params,"max")} aria-label="Precio máximo"/></div></div>
    {sizes.length>0&&<div className="field"><label htmlFor="size">Talla</label><select id="size" name="size" className="input" defaultValue={value(params,"size")}><option value="">Todas</option>{sizes.map(item=><option key={item}>{item}</option>)}</select></div>}
    {colors.length>0&&<div className="field"><label htmlFor="color">Color</label><select id="color" name="color" className="input" defaultValue={value(params,"color")}><option value="">Todos</option>{colors.map(item=><option key={item}>{item}</option>)}</select></div>}
    <div className="grid gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" name="available" value="true" defaultChecked={value(params,"available")==="true"}/> Solo disponibles</label><label className="flex items-center gap-2"><input type="checkbox" name="new" value="true" defaultChecked={value(params,"new")==="true"}/> Solo nuevos</label><label className="flex items-center gap-2"><input type="checkbox" name="sale" value="true" defaultChecked={value(params,"sale")==="true"}/> En oferta</label></div>
    <button className="button-primary">Aplicar filtros</button>
  </form>;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params=await searchParams; const sort=value(params,"sort")||"recent"; const min=Number(value(params,"min")||0); const max=Number(value(params,"max")||Number.MAX_SAFE_INTEGER); const page=Math.max(1,Number(value(params,"page")||1));
  const [allProducts,categories]=await Promise.all([getProducts({limit:1000}),getCategories()]);
  const sizes=[...new Set(allProducts.flatMap(p=>p.variants??[]).map(v=>v.size).filter(Boolean))].sort() as string[]; const colors=[...new Set(allProducts.flatMap(p=>p.variants??[]).map(v=>v.color).filter(Boolean))].sort() as string[];
  const category=value(params,"category"); const selectedSize=value(params,"size"); const selectedColor=value(params,"color");
  let filtered=allProducts.filter(product=>product.price>=min&&product.price<=max)
    .filter(product=>!category||product.category?.slug===category)
    .filter(product=>value(params,"new")!=="true"||product.is_new)
    .filter(product=>value(params,"sale")!=="true"||product.on_sale)
    .filter(product=>value(params,"available")!=="true"||availableStock(product)>0)
    .filter(product=>!selectedSize||product.variants?.some(v=>v.size===selectedSize&&v.stock>0))
    .filter(product=>!selectedColor||product.variants?.some(v=>v.color===selectedColor&&v.stock>0));
  filtered=filtered.sort((a,b)=>sort==="price-asc"?a.price-b.price:sort==="price-desc"?b.price-a.price:sort==="featured"?Number(b.featured)-Number(a.featured):new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  const pageSize=24; const pages=Math.max(1,Math.ceil(filtered.length/pageSize)); const products=filtered.slice((Math.min(page,pages)-1)*pageSize,Math.min(page,pages)*pageSize);
  const pageHref=(target:number)=>{const query=new URLSearchParams();Object.entries(params).forEach(([key,current])=>{if(typeof current==="string"&&key!=="page"&&current)query.set(key,current);});query.set("page",String(target));return `/tienda?${query}`;};
  return <main className="container-page py-10 md:py-16"><nav className="muted text-xs">Inicio / Tienda</nav><div className="mt-4 flex flex-col gap-5 border-b hairline pb-8 md:flex-row md:items-end md:justify-between"><div><h1 className="display text-5xl md:text-6xl">La tienda</h1><p className="muted mt-2 text-sm">{filtered.length} productos</p></div><form className="flex gap-3">{Object.entries(params).map(([key,current])=>key!=="sort"&&key!=="page"&&typeof current==="string"?<input key={key} type="hidden" name={key} value={current}/>:null)}<select name="sort" defaultValue={sort} className="input min-w-52" aria-label="Ordenar productos"><option value="recent">Más recientes</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="featured">Destacados</option></select><button className="button-secondary">Ordenar</button></form></div>
  <details className="mt-6 border-y hairline py-3 lg:hidden"><summary className="flex min-h-11 list-none items-center justify-between font-bold">Filtrar productos<SlidersHorizontal size={18}/></summary><div className="pt-5"><Filters params={params} categories={categories} sizes={sizes} colors={colors}/></div></details>
  <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]"><aside className="hidden lg:block"><Filters params={params} categories={categories} sizes={sizes} colors={colors}/></aside><div><ProductGrid products={products}/>{pages>1&&<nav className="mt-12 flex justify-center gap-2" aria-label="Paginación">{Array.from({length:pages},(_,index)=>index+1).map(item=><Link key={item} href={pageHref(item)} className={`grid size-11 place-items-center border ${item===page?"border-[var(--ink)] bg-[var(--ink)] text-white":"hairline"}`}>{item}</Link>)}</nav>}</div></div></main>;
}
