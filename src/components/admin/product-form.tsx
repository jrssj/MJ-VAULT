"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { saveProductAction } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import type { Category, Product } from "@/types";

type EditableImage = { image_url: string; alt_text: string | null; is_primary: boolean; sort_order: number };
type EditableVariant = { id?: string; size: string | null; color: string | null; sku: string; stock: number; active: boolean };

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Selecciona un archivo de imagen.");
  const bitmap = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }) : file;
}

export function ProductForm({
  product,
  categories,
  error,
  saved,
}: {
  product?: Product | null;
  categories: Category[];
  error?: string;
  saved?: boolean;
}) {
  const isEditing = Boolean(product?.id);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [images, setImages] = useState<EditableImage[]>(
    (product?.images ?? []).map((image, index) => ({
      image_url: image.image_url,
      alt_text: image.alt_text,
      is_primary: index === 0,
      sort_order: index,
    }))
  );
  const [variants, setVariants] = useState<EditableVariant[]>(
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      active: v.active,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Conversión de moneda (USD -> MXN)
  const [exchangeRate, setExchangeRate] = useState<number>(20);
  const [priceUsd, setPriceUsd] = useState<string>(() => {
    if (product?.price) {
      return (product.price / 20).toFixed(2).replace(/\.00$/, "");
    }
    return "";
  });
  const [priceMxn, setPriceMxn] = useState<string>(() => {
    return product?.price ? String(product.price) : "";
  });

  const [compareUsd, setCompareUsd] = useState<string>(() => {
    if (product?.compare_at_price) {
      return (product.compare_at_price / 20).toFixed(2).replace(/\.00$/, "");
    }
    return "";
  });
  const [compareMxn, setCompareMxn] = useState<string>(() => {
    return product?.compare_at_price ? String(product.compare_at_price) : "";
  });

  const handlePriceUsdChange = (val: string, rate = exchangeRate) => {
    setPriceUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setPriceMxn(String(Math.round(num * rate)));
    } else {
      setPriceMxn("");
    }
  };

  const handlePriceMxnChange = (val: string, rate = exchangeRate) => {
    setPriceMxn(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && rate > 0) {
      setPriceUsd((num / rate).toFixed(2).replace(/\.00$/, ""));
    } else {
      setPriceUsd("");
    }
  };

  const handleCompareUsdChange = (val: string, rate = exchangeRate) => {
    setCompareUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCompareMxn(String(Math.round(num * rate)));
    } else {
      setCompareMxn("");
    }
  };

  const handleCompareMxnChange = (val: string, rate = exchangeRate) => {
    setCompareMxn(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && rate > 0) {
      setCompareUsd((num / rate).toFixed(2).replace(/\.00$/, ""));
    } else {
      setCompareUsd("");
    }
  };

  const handleRateChange = (newRateVal: string) => {
    const r = parseFloat(newRateVal) || 20;
    setExchangeRate(r);
    if (priceUsd) {
      const num = parseFloat(priceUsd);
      if (!isNaN(num)) setPriceMxn(String(Math.round(num * r)));
    }
    if (compareUsd) {
      const num = parseFloat(compareUsd);
      if (!isNaN(num)) setCompareMxn(String(Math.round(num * r)));
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const original of Array.from(files).slice(0, 12 - images.length)) {
        const file = await optimizeImage(original);
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const result = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !result.url) throw new Error(result.error ?? "No pudimos subir la imagen.");
        setImages((current) => [
          ...current,
          {
            image_url: result.url!,
            alt_text: name || null,
            is_primary: current.length === 0,
            sort_order: current.length,
          },
        ]);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "No pudimos subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((image, i) => ({ ...image, is_primary: i === 0, sort_order: i }));
    });
  };

  const addVariant = () =>
    setVariants((current) => [
      ...current,
      { size: null, color: null, sku: "", stock: 0, active: true },
    ]);

  return (
    <div className="space-y-6">
      {saved && (
        <div className="border border-emerald-300 bg-emerald-50/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 text-base">
                {isEditing ? "Producto actualizado correctamente" : "Producto agregado y activado con éxito en la tienda"}
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                {isEditing
                  ? "Los cambios ya están reflejados en el catálogo."
                  : "El formulario está limpio y listo para que agregues el siguiente producto."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/productos"
              className="button-secondary text-xs py-2 px-4 whitespace-nowrap bg-white hover:bg-stone-50"
            >
              Ver lista de productos
            </Link>
          </div>
        </div>
      )}

      <form action={saveProductAction} className="grid gap-8 xl:grid-cols-[1fr_350px]">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <input type="hidden" name="variants" value={JSON.stringify(variants)} />

        <section className="space-y-7">
          <div className="border hairline bg-[var(--paper)] p-5 md:p-7">
            <h2 className="display mb-6 text-3xl">Información</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="field md:col-span-2">
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  name="name"
                  required
                  className="input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!product) setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="field md:col-span-2">
                <label htmlFor="slug">URL amigable</label>
                <input
                  id="slug"
                  name="slug"
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  className="input"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                />
              </div>
              <div className="field md:col-span-2">
                <label htmlFor="short_description">Descripción corta</label>
                <input
                  id="short_description"
                  name="short_description"
                  maxLength={180}
                  className="input"
                  defaultValue={product?.short_description ?? ""}
                />
              </div>
              <div className="field md:col-span-2">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  className="input"
                  defaultValue={product?.description ?? ""}
                />
              </div>
              <div className="field md:col-span-2">
                <label htmlFor="details">Materiales o detalles</label>
                <textarea
                  id="details"
                  name="details"
                  className="input"
                  defaultValue={product?.details ?? ""}
                />
              </div>
            </div>
          </div>

          <div className="border hairline bg-[var(--paper)] p-5 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="display text-3xl">Imágenes</h2>
              <label className="button-secondary cursor-pointer">
                <ImagePlus size={17} />
                {uploading ? "Subiendo…" : "Agregar"}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  disabled={uploading}
                  onChange={(e) => upload(e.target.files)}
                />
              </label>
            </div>
            <p className="muted mt-2 text-xs">La primera imagen es la portada. Máximo 12 imágenes y 6 MB cada una.</p>
            {uploadError && (
              <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
                {uploadError}
              </p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={`${image.image_url}-${index}`} className="relative">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white">
                    <Image
                      src={image.image_url}
                      alt={image.alt_text ?? name}
                      fill
                      sizes="180px"
                      className="object-cover object-top"
                    />
                    {index === 0 && <span className="pill absolute left-2 top-2">Portada</span>}
                  </div>
                  <div className="mt-2 flex justify-center gap-1">
                    <button
                      type="button"
                      className="p-2"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Mover antes"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="p-2"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label="Mover después"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-[var(--danger)]"
                      onClick={() =>
                        setImages((current) =>
                          current
                            .filter((_, i) => i !== index)
                            .map((entry, i) => ({ ...entry, is_primary: i === 0, sort_order: i }))
                        )
                      }
                      aria-label="Eliminar imagen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border hairline bg-[var(--paper)] p-5 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="display text-3xl">Variantes</h2>
                <p className="muted mt-2 text-xs">Crea combinaciones de aroma, talla o color con inventario propio.</p>
              </div>
              <button type="button" className="button-secondary" onClick={addVariant}>
                <Plus size={16} />
                Agregar
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={variant.id ?? index}
                  className="grid gap-3 border hairline p-4 sm:grid-cols-[1fr_1fr_1.3fr_100px_auto]"
                >
                  <input
                    className="input"
                    placeholder="Aroma / Talla"
                    aria-label="Aroma o talla"
                    value={variant.size ?? ""}
                    onChange={(e) =>
                      setVariants((current) =>
                        current.map((v, i) => (i === index ? { ...v, size: e.target.value || null } : v))
                      )
                    }
                  />
                  <input
                    className="input"
                    placeholder="Color"
                    aria-label="Color"
                    value={variant.color ?? ""}
                    onChange={(e) =>
                      setVariants((current) =>
                        current.map((v, i) => (i === index ? { ...v, color: e.target.value || null } : v))
                      )
                    }
                  />
                  <input
                    className="input"
                    placeholder="SKU"
                    aria-label="SKU de variante"
                    required
                    value={variant.sku}
                    onChange={(e) =>
                      setVariants((current) =>
                        current.map((v, i) => (i === index ? { ...v, sku: e.target.value } : v))
                      )
                    }
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    aria-label="Stock"
                    value={variant.stock}
                    onChange={(e) =>
                      setVariants((current) =>
                        current.map((v, i) => (i === index ? { ...v, stock: Number(e.target.value) } : v))
                      )
                    }
                  />
                  <button
                    type="button"
                    className="p-3 text-[var(--danger)]"
                    onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}
                    aria-label="Eliminar variante"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              {!variants.length && (
                <p className="muted border border-dashed hairline p-6 text-center text-sm">
                  Este producto usa un stock general. Agrega variantes si cambia por aroma, talla o color.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="border hairline bg-[var(--paper)] p-5 space-y-4">
            <div className="flex items-center justify-between border-b hairline pb-3">
              <div>
                <h2 className="display text-3xl">Precios</h2>
                <p className="muted text-xs mt-0.5">Conversión automática USD a MXN</p>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 text-xs rounded">
                <span className="text-stone-500">1 USD =</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={exchangeRate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className="w-14 bg-white border hairline px-1 py-0.5 text-center font-semibold text-stone-900 rounded"
                  title="Tasa de cambio USD a MXN"
                />
                <span className="font-semibold text-stone-700">MXN</span>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Precio Principal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Precio de venta *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="field">
                    <span className="text-[11px] text-stone-500 mb-1 block">En Dólares (USD)</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="3.25"
                        value={priceUsd}
                        onChange={(e) => handlePriceUsdChange(e.target.value)}
                        className="input pl-6 text-sm"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <span className="text-[11px] font-semibold text-emerald-800 mb-1 block">Final Tienda (MXN)</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="1"
                        required
                        placeholder="65"
                        value={priceMxn}
                        onChange={(e) => handlePriceMxnChange(e.target.value)}
                        className="input pl-6 font-bold text-stone-900 bg-emerald-50/40 border-emerald-300"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">
                  {priceMxn ? `El cliente verá $${priceMxn} MXN en la tienda.` : "Ingresa en dólares y se calcula automáticamente en pesos."}
                </p>
              </div>

              {/* Precio Anterior / Oferta */}
              <div className="space-y-1.5 pt-2 border-t hairline">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Precio anterior (oferta tachada)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="field">
                    <span className="text-[11px] text-stone-500 mb-1 block">En USD</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="4.00"
                        value={compareUsd}
                        onChange={(e) => handleCompareUsdChange(e.target.value)}
                        className="input pl-6 text-sm"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <span className="text-[11px] text-stone-500 mb-1 block">En MXN</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        id="compare_at_price"
                        name="compare_at_price"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="80"
                        value={compareMxn}
                        onChange={(e) => handleCompareMxnChange(e.target.value)}
                        className="input pl-6 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Costo opcional */}
              <div className="space-y-1.5 pt-2 border-t hairline">
                <label htmlFor="cost" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Costo interno opcional (en MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input
                    id="cost"
                    name="cost"
                    type="number"
                    min="0"
                    step="1"
                    className="input pl-6 text-sm"
                    placeholder="En MXN"
                    defaultValue={product?.cost ?? ""}
                  />
                </div>
              </div>

              {/* SKU & Inventario */}
              <div className="pt-2 border-t hairline space-y-4">
                <div className="field">
                  <label htmlFor="sku">SKU general</label>
                  <input id="sku" name="sku" className="input" defaultValue={product?.sku ?? ""} />
                </div>
                <div className="field">
                  <label htmlFor="stock">Stock general</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    className="input"
                    defaultValue={product?.stock ?? 1}
                  />
                </div>
                <div className="field">
                  <label htmlFor="low_stock_threshold">Alerta de poco stock</label>
                  <input
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    type="number"
                    min="0"
                    step="1"
                    className="input"
                    defaultValue={product?.low_stock_threshold ?? 3}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border hairline bg-[var(--paper)] p-5">
            <h2 className="display mb-5 text-3xl">Organización</h2>
            <div className="field">
              <label htmlFor="category_id">Categoría</label>
              <select
                id="category_id"
                name="category_id"
                className="input"
                defaultValue={product?.category_id ?? ""}
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                ["active", "Producto activo (visible en la tienda)", isEditing ? Boolean(product?.active) : true],
                ["featured", "Destacado", product?.featured ?? false],
                ["is_new", "Nuevo", isEditing ? (product?.is_new ?? false) : true],
                ["on_sale", "En oferta", product?.on_sale ?? false],
              ].map(([key, label, checked]) => (
                <label key={String(key)} className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name={String(key)}
                    defaultChecked={Boolean(checked)}
                    className="h-4 w-4 accent-[var(--gold)]"
                  />
                  <span className={key === "active" ? "font-semibold text-stone-950" : "text-stone-700"}>
                    {String(label)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="border border-[var(--danger)] bg-red-50 p-4 text-sm text-[var(--danger)]">
              {error === "sin-supabase"
                ? "Para guardar productos o subir imágenes a la nube debes configurar tus credenciales de Supabase en .env.local."
                : "No pudimos guardar. Revisa los campos, SKU e imágenes."}
            </p>
          )}

          <button className="button-primary w-full" disabled={uploading}>
            {isEditing ? "Guardar cambios" : "Guardar y agregar otro"}
          </button>
        </aside>
      </form>
    </div>
  );
}
