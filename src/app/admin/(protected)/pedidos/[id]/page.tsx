import { notFound } from "next/navigation";
import { AlertCircle, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { getSettings } from "@/lib/data";
import type { OrderStatus } from "@/types";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: order }, settings] = await Promise.all([
    supabase.from("orders").select("*, order_items(*)").eq("id", id).single(),
    getSettings(),
  ]);

  if (!order) notFound();

  const statuses: OrderStatus[] = [
    "PENDIENTE_CONTACTO",
    "CONTACTADO",
    "CONFIRMADO",
    "PAGADO",
    "ENVIADO",
    "ENTREGADO",
    "CANCELADO",
  ];

  const number = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const customerPhoneClean = String(order.phone).replace(/\D/g, "");
  const targetPhone = customerPhoneClean || String(number).replace(/\D/g, "");

  const message = encodeURIComponent(
    `Hola ${order.customer_name}, te contactamos de MJ Vault respecto a tu pedido #${order.order_number}.`
  );

  const orderTotal = order.total || order.subtotal;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[var(--gold)]">{formatDate(order.created_at)}</p>
          <h1 className="display mt-2 text-5xl">Pedido {order.order_number}</h1>
        </div>
        {targetPhone && (
          <a
            className="button-primary flex items-center gap-2"
            href={`https://wa.me/${targetPhone}?text=${message}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} />
            Contactar al cliente por WhatsApp
          </a>
        )}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="border hairline bg-[var(--paper)]">
          <h2 className="display border-b hairline p-5 text-3xl">Productos del pedido</h2>
          <div>
            {order.order_items.map(
              (item: {
                id: string;
                product_name_snapshot: string;
                variant_snapshot: { size?: string; color?: string };
                quantity: number;
                unit_price: number;
                subtotal: number;
              }) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 border-b hairline p-5 text-sm"
                >
                  <div>
                    <strong>
                      {item.quantity} × {item.product_name_snapshot}
                    </strong>
                    <p className="muted mt-1 text-xs">
                      {[item.variant_snapshot?.color, item.variant_snapshot?.size]
                        .filter(Boolean)
                        .join(" · ") || "Sin variante específica"}
                    </p>
                    <p className="muted mt-1 text-xs">
                      {formatCurrency(item.unit_price)} cada unidad
                    </p>
                  </div>
                  <strong className="font-medium">
                    {formatCurrency(item.subtotal)}
                  </strong>
                </div>
              )
            )}
          </div>

          <div className="space-y-3 border-t hairline p-5 text-sm">
            <div className="flex justify-between">
              <span className="muted">Subtotal productos</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="muted">
                Envío ({order.shipping_zone_name || "Por confirmar"})
              </span>
              <span>
                {order.shipping_cost > 0
                  ? formatCurrency(order.shipping_cost)
                  : order.shipping_zone_name && order.shipping_cost === 0
                  ? "Gratis"
                  : "Por confirmar"}
              </span>
            </div>
            <div className="flex justify-between border-t hairline pt-3 text-base font-bold">
              <span>Total del pedido</span>
              <span>{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="border hairline bg-[var(--paper)] p-5">
            <h2 className="display text-3xl">Estado</h2>
            <form action={updateOrderStatusAction.bind(null, id)} className="mt-5 grid gap-3">
              <select name="status" defaultValue={order.status} className="input">
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              {order.status === "CANCELADO" && (
                <div className="flex items-start gap-2 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>
                    Este pedido se encuentra cancelado. Su stock fue repuesto al inventario.
                  </span>
                </div>
              )}

              <button className="button-primary">Actualizar estado</button>
            </form>
          </section>

          <section className="border hairline bg-[var(--paper)] p-5">
            <h2 className="display text-3xl">Datos del cliente</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div>
                <dt className="muted text-xs">Nombre completo</dt>
                <dd className="font-medium">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="muted text-xs">Teléfono</dt>
                <dd className="font-medium">{order.phone}</dd>
              </div>
              <div>
                <dt className="muted text-xs">Zona / Método de entrega</dt>
                <dd className="font-medium">
                  {order.shipping_zone_name || "Sin zona asignada"} · {order.delivery_method}
                </dd>
              </div>
              <div>
                <dt className="muted text-xs">Dirección y Barrio</dt>
                <dd className="font-medium">
                  {order.address}, {order.neighborhood}
                  <br />
                  {order.city}, {order.department}
                </dd>
              </div>
              {order.notes && (
                <div>
                  <dt className="muted text-xs">Notas / Referencias</dt>
                  <dd className="font-medium whitespace-pre-wrap">{order.notes}</dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
