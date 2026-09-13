import { getCategories } from "@/lib/data";
import { ProductForm } from "@/components/admin/product-form";
import { hasSupabaseEnv } from "@/lib/env";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const [categories, params] = await Promise.all([
    getCategories(true),
    searchParams,
  ]);
  const isDevWithoutSupabase =
    process.env.NODE_ENV === "development" && !hasSupabaseEnv();

  return (
    <>
      <p className="eyebrow text-[var(--gold)]">Catálogo</p>
      <h1 className="display mb-4 mt-2 text-5xl">Nuevo producto</h1>

      {isDevWithoutSupabase && (
        <div className="mb-8 border hairline bg-amber-50/90 p-4 text-sm text-amber-800">
          <p className="font-semibold uppercase tracking-wider text-amber-800">
            Aviso: Supabase aún no conectado
          </p>
          <p className="mt-1 text-xs">
            Para guardar productos y subir imágenes a la base de datos debes configurar tus credenciales de Supabase en el archivo <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env.local</code>.
          </p>
        </div>
      )}

      <ProductForm
        categories={categories}
        error={params.error}
        saved={params.saved === "true"}
      />
    </>
  );
}
