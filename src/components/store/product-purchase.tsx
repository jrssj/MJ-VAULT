"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { useCart } from "./cart-provider";

export function ProductPurchase({ product }: { product: Product }) {
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[],
    [variants]
  );
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[],
    [variants]
  );

  const [color, setColor] = useState(() => (colors.length === 1 ? colors[0] : ""));
  const [size, setSize] = useState(() => (sizes.length === 1 ? sizes[0] : ""));
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const totalProductStock = useMemo(() => {
    if (variants.length > 0) {
      return variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return product.stock;
  }, [variants, product.stock]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find(
      (variant) =>
        (!colors.length || variant.color === color) &&
        (!sizes.length || variant.size === size)
    );
  }, [variants, colors.length, sizes.length, color, size]);

  const activePrice = selectedVariant?.price ?? product.price;
  const hasVariantPrice = Boolean(selectedVariant?.price && selectedVariant.price !== product.price);
  const isStorage = sizes.some((s) => /\b(gb|tb|mb)\b/i.test(s));
  const sizeLabel = isStorage ? "Capacidad" : "Talla / Medida";

  const selectionComplete =
    !variants.length ||
    Boolean((!colors.length || color) && (!sizes.length || size));

  const stock = variants.length ? selectedVariant?.stock ?? 0 : product.stock;
  const soldOut = selectionComplete && stock === 0;

  const isColorUnavailable = (cVal: string) => {
    if (size) {
      return !variants.some(
        (v) => v.color === cVal && v.size === size && v.stock > 0
      );
    }
    return !variants.some((v) => v.color === cVal && v.stock > 0);
  };

  const isSizeUnavailable = (sVal: string) => {
    if (color) {
      return !variants.some(
        (v) => v.color === color && v.size === sVal && v.stock > 0
      );
    }
    return !variants.some((v) => v.size === sVal && v.stock > 0);
  };

  const handleAdd = () => {
    if (!selectionComplete || stock < 1) return;
    const image =
      product.images?.find((entry) => entry.is_primary) ?? product.images?.[0];
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      slug: product.slug,
      name: product.name,
      image: image?.image_url ?? null,
      price: activePrice,
      quantity,
      size: selectedVariant?.size ?? null,
      color: selectedVariant?.color ?? null,
      maxStock: stock,
    });
  };

  if (totalProductStock === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {formatCurrency(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-base text-stone-400 line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </div>
        <div className="border border-[var(--danger)] bg-red-50 p-4 text-center">
          <p className="text-sm font-bold tracking-wider text-[var(--danger)] uppercase">
            Producto agotado
          </p>
          <p className="muted mt-1 text-xs">
            Actualmente no hay unidades disponibles para este producto.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="button-primary w-full cursor-not-allowed opacity-50"
        >
          Agotado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
          {formatCurrency(activePrice)}
        </span>
        {product.compare_at_price && (
          <span className="text-base text-stone-400 line-through">
            {formatCurrency(product.compare_at_price)}
          </span>
        )}
        {hasVariantPrice && (
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
            Precio para esta opción
          </span>
        )}
      </div>

      {colors.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3">Color</legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((value) => {
              const unavailable = isColorUnavailable(value);
              const isSelected = color === value;
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => {
                    setColor(value);
                    setQuantity(1);
                  }}
                  disabled={unavailable}
                  className={`relative min-h-11 border px-4 text-sm transition ${
                    isSelected
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                      : unavailable
                      ? "cursor-not-allowed border-dashed opacity-40 line-through"
                      : "hairline hover:border-[var(--ink)]"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3">{sizeLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((value) => {
              const unavailable = isSizeUnavailable(value);
              const isSelected = size === value;
              const matchingVariant = variants.find(
                (v) => v.size === value && (!color || v.color === color)
              );
              const variantPrice = matchingVariant?.price;
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => {
                    setSize(value);
                    setQuantity(1);
                  }}
                  disabled={unavailable}
                  className={`flex items-center gap-2 min-h-11 border px-3.5 py-1 text-sm font-medium transition ${
                    isSelected
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-sm"
                      : unavailable
                      ? "cursor-not-allowed border-dashed opacity-40 line-through"
                      : "hairline hover:border-[var(--ink)] bg-white"
                  }`}
                >
                  <span>{value}</span>
                  {variantPrice && variantPrice !== product.price ? (
                    <span
                      className={`text-xs ${
                        isSelected ? "text-stone-300" : "text-stone-500"
                      }`}
                    >
                      ({formatCurrency(variantPrice)})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        {!selectionComplete ? (
          <p className="text-sm text-[var(--gold)]">
            Selecciona tus opciones para ver disponibilidad.
          </p>
        ) : soldOut ? (
          <p className="text-sm font-bold text-[var(--danger)]">
            Agotado en esta combinación
          </p>
        ) : (
          <p className="text-sm text-[var(--success)]">
            Disponible · {stock} {stock === 1 ? "unidad" : "unidades"}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <div className="inline-flex items-center border hairline">
          <button
            type="button"
            className="p-3"
            onClick={() => setQuantity((v) => Math.max(1, v - 1))}
            aria-label="Reducir cantidad"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-10 text-center font-medium">{quantity}</span>
          <button
            type="button"
            className="p-3"
            onClick={() => setQuantity((v) => Math.min(stock, v + 1))}
            disabled={!stock || quantity >= stock}
            aria-label="Aumentar cantidad"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectionComplete || soldOut}
          className="button-primary flex-1"
        >
          <ShoppingBag size={17} /> {soldOut ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}

