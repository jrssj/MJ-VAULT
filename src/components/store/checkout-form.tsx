"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/lib/validation";
import { useCart } from "./cart-provider";
import { formatCurrency } from "@/lib/format";
import type { ShippingZone } from "@/types";
import { z } from "zod";

type Fields = Omit<z.input<typeof checkoutSchema>, "items">;

type OrderResponse = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  shippingZoneName: string;
  total: number;
  whatsapp: string;
  items: {
    product_name_snapshot: string;
    variant_snapshot: { size?: string; color?: string };
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
  error?: string;
};

export function CheckoutForm({ initialZones = [] }: { initialZones?: ShippingZone[] }) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(initialZones[0]?.id ?? "");

  const selectedZone = useMemo(
    () => initialZones.find((z) => z.id === selectedZoneId),
    [initialZones, selectedZoneId]
  );

  const shippingCost = useMemo(() => {
    if (!selectedZone) return null;
    if (
      selectedZone.free_shipping_threshold !== null &&
      subtotal >= selectedZone.free_shipping_threshold
    ) {
      return 0;
    }
    return selectedZone.price;
  }, [selectedZone, subtotal]);

  const total = useMemo(() => {
    if (shippingCost === null) return subtotal;
    return subtotal + shippingCost;
  }, [subtotal, shippingCost]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(checkoutSchema.omit({ items: true })),
    defaultValues: {
      deliveryMethod: "Envío a domicilio",
      shippingZoneId: initialZones[0]?.id ?? null,
      shippingZoneName: initialZones[0]?.name ?? "Por confirmar",
      addressReference: "",
      notes: "",
    },
  });

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const zone = initialZones.find((z) => z.id === zoneId);
    setValue("shippingZoneId", zoneId || null);
    setValue("shippingZoneName", zone?.name ?? "Por confirmar");
  };

  const submit = handleSubmit(async (values) => {
    if (submitting) return;
    setServerError("");
    setSubmitting(true);

    try {
      const payload = {
        ...values,
        neighborhood: values.neighborhood?.trim() || "N/A",
        shippingZoneId: selectedZone?.id ?? null,
        shippingZoneName: selectedZone?.name ?? "Por confirmar",
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as OrderResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "No pudimos crear el pedido. Intenta nuevamente.");
      }

      const productLines = data.items
        .map((item) => {
          const options = [
            item.variant_snapshot?.color && `Color: ${item.variant_snapshot.color}`,
            item.variant_snapshot?.size && `Talla: ${item.variant_snapshot.size}`,
          ].filter(Boolean);

          return `${item.quantity}x ${item.product_name_snapshot}${
            options.length ? `\n(${options.join(" · ")})` : ""
          }\nPrecio: ${formatCurrency(item.unit_price)}\nSubtotal: ${formatCurrency(item.subtotal)}`;
        })
        .join("\n\n");

      const shippingLabel =
        data.shippingCost === 0 && selectedZone?.free_shipping_threshold !== null
          ? "Gratis"
          : data.shippingCost > 0
          ? formatCurrency(data.shippingCost)
          : "Por confirmar";

      const message = [
        "Hola, quiero confirmar mi pedido en MJ VAULT.",
        "",
        `Pedido: #${data.orderNumber}`,
        "",
        "PRODUCTOS:",
        productLines,
        "",
        `Subtotal: ${formatCurrency(data.subtotal)}`,
        `Envío (${data.shippingZoneName || "Por confirmar"}): ${shippingLabel}`,
        `Total: ${formatCurrency(data.total ?? data.subtotal)}`,
        "",
        "CLIENTE:",
        `Nombre: ${values.customerName}`,
        `Teléfono: ${values.phone}`,
        "",
        "ENTREGA:",
        `Ciudad: ${values.city}, ${values.department}`,
        `Dirección: ${values.address}`,
        values.neighborhood && values.neighborhood.trim() !== "N/A"
          ? `Colonia/Barrio: ${values.neighborhood.trim()}`
          : null,
        values.addressReference ? `Referencia: ${values.addressReference}` : null,
        `Método: ${values.deliveryMethod}`,
        values.notes ? `Observaciones: ${values.notes}` : null,
        "",
        "Quedo a la espera de la confirmación de disponibilidad y datos para el pago.",
      ]
        .filter((line) => line !== null)
        .join("\n");

      clear();

      const waUrl = `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      router.push(`/checkout/exito?pedido=${encodeURIComponent(data.orderNumber)}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No pudimos procesar tu pedido.");
      setSubmitting(false);
    }
  });

  if (!items.length) {
    return (
      <div className="border-y hairline py-16 text-center">
        <h2 className="display text-4xl">No hay productos para finalizar</h2>
        <button className="button-primary mt-6" onClick={() => router.push("/tienda")}>
          Ir a la tienda
        </button>
      </div>
    );
  }

  const fieldError = (name: keyof Fields) =>
    errors[name] ? <span className="text-xs text-[var(--danger)]">Este campo es requerido o no es válido.</span> : null;

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section className="grid gap-6">
        <div className="border hairline bg-[var(--paper)] p-5 md:p-7">
          <h2 className="display mb-5 text-2xl md:text-3xl">Datos de contacto y entrega</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field md:col-span-2">
              <label htmlFor="customerName">Nombre completo</label>
              <input
                id="customerName"
                className="input"
                autoComplete="name"
                placeholder="Ej. Camila Torres"
                {...register("customerName")}
              />
              {fieldError("customerName")}
            </div>

            <div className="field">
              <label htmlFor="phone">Teléfono / WhatsApp</label>
              <input
                id="phone"
                className="input"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej. +1 (303) 905-6030 o +52 55 1234 5678"
                {...register("phone")}
              />
              {fieldError("phone")}
            </div>

            <div className="field">
              <label htmlFor="department">Estado / Provincia / Departamento</label>
              <input
                id="department"
                className="input"
                autoComplete="address-level1"
                placeholder="Ej. California, CDMX, Florida..."
                {...register("department")}
              />
              {fieldError("department")}
            </div>

            <div className="field">
              <label htmlFor="city">Ciudad</label>
              <input
                id="city"
                className="input"
                autoComplete="address-level2"
                placeholder="Ej. Denver, Miami, Ciudad de México, Bogotá..."
                {...register("city")}
              />
              {fieldError("city")}
            </div>

            <div className="field">
              <label htmlFor="neighborhood">Colonia / Vecindario / Barrio (opcional)</label>
              <input
                id="neighborhood"
                className="input"
                placeholder="Ej. Polanco, Brickell, Centro o N/A"
                {...register("neighborhood")}
              />
              {fieldError("neighborhood")}
            </div>

            <div className="field md:col-span-2">
              <label htmlFor="address">Dirección de entrega (Calle, Número, Apto)</label>
              <input
                id="address"
                className="input"
                autoComplete="street-address"
                placeholder="Ej. 1200 Grand Ave, Apt 4B o Av. Insurgentes 450"
                {...register("address")}
              />
              {fieldError("address")}
            </div>

            <div className="field md:col-span-2">
              <label htmlFor="addressReference">Referencia / Código postal / Instrucciones (opcional)</label>
              <input
                id="addressReference"
                className="input"
                placeholder="Ej. ZIP 80202, entrecalles o código de acceso"
                {...register("addressReference")}
              />
            </div>

            <div className="field">
              <label htmlFor="shippingZone">Zona de envío</label>
              <select
                id="shippingZone"
                className="input"
                value={selectedZoneId}
                onChange={(e) => handleZoneChange(e.target.value)}
              >
                {initialZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({formatCurrency(z.price)})
                  </option>
                ))}
                <option value="">Otra ubicación / Por acordar</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="deliveryMethod">Método de entrega</label>
              <select id="deliveryMethod" className="input" {...register("deliveryMethod")}>
                <option value="Envío a domicilio">Envío a domicilio</option>
                <option value="Por acordar con MJ Vault">Por acordar con MJ Vault</option>
              </select>
            </div>

            <div className="field md:col-span-2">
              <label htmlFor="notes">Observaciones o notas (opcional)</label>
              <textarea
                id="notes"
                className="input"
                placeholder="Indicaciones para la entrega o peticiones especiales"
                {...register("notes")}
              />
            </div>
          </div>
        </div>

        {serverError && (
          <div
            role="alert"
            className="border border-[var(--danger)] bg-red-50 p-4 text-sm text-[var(--danger)]"
          >
            {serverError}
          </div>
        )}
      </section>

      <aside className="h-fit bg-[#171512] p-6 text-white lg:sticky lg:top-28">
        <p className="eyebrow text-[var(--gold-soft)]">Resumen de compra</p>

        <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.key} className="flex justify-between gap-4 text-sm">
              <div>
                <span className="font-medium">
                  {item.quantity} × {item.name}
                </span>
                {(item.color || item.size) && (
                  <p className="mt-0.5 text-xs text-white/55">
                    {[item.color, item.size].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <span className="whitespace-nowrap font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-6 space-y-2 border-y border-white/20 py-4 text-sm">
          <div className="flex justify-between text-white/80">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-white/80">
            <span>
              Envío{" "}
              {selectedZone ? (
                <span className="text-xs text-white/50">({selectedZone.name})</span>
              ) : null}
            </span>
            <span>
              {shippingCost === null ? (
                "Por confirmar"
              ) : shippingCost === 0 ? (
                <span className="text-[var(--gold-soft)] font-medium">Gratis</span>
              ) : (
                formatCurrency(shippingCost)
              )}
            </span>
          </div>

          <div className="flex justify-between pt-2 text-base font-bold text-white">
            <span>Total</span>
            <span>
              {formatCurrency(total)}
              {shippingCost === null && (
                <span className="block text-right text-xs font-normal text-white/60">
                  + envío por confirmar
                </span>
              )}
            </span>
          </div>
        </div>

        <p className="text-xs leading-5 text-white/60">
          Tu pedido quedará registrado en nuestro sistema antes de abrir WhatsApp para coordinar el pago y envío.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="button-dark mt-6 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Creando pedido…" : "Confirmar pedido en WhatsApp"}
        </button>
      </aside>
    </form>
  );
}
