import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, phone, city, subtotal, shipping_cost, total, status, created_at, order_items(quantity)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (status) query = query.eq("status", status);
  if (q?.trim()) {
    const safe = q.trim().replace(/[%_,()]/g, " ");
    query = query.or(`order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  const { data: orders } = await query;
  const statuses: OrderStatus[] = [
    "PENDIENTE_CONTACTO",
    "CONTACTADO",
    "CONFIRMADO",
    "PAGADO",
    "ENVIADO",
    "ENTREGADO",
    "CANCELADO",
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[var(--gold)]">Ventas</p>
          <h1 className="display mt-2 text-5xl">Pedidos</h1>
          <p className="muted mt-2 text-sm">
            Gestiona pedidos, estados de entrega y atención a clientes.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex w-full max-w-md gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por # pedido, cliente o teléfono"
              className="input pl-10 text-sm"
              aria-label="Buscar pedidos"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
          </div>
          <button className="button-secondary">Buscar</button>
        </form>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          className={`whitespace-nowrap border px-3 py-2 text-xs transition ${
            !status ? "bg-[#12110f] text-white" : "hairline hover:border-[var(--ink)]"
          }`}
          href="/admin/pedidos"
        >
          Todos
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            className={`whitespace-nowrap border px-3 py-2 text-xs transition ${
              status === s ? "bg-[#12110f] text-white" : "hairline hover:border-[var(--ink)]"
            }`}
            href={`/admin/pedidos?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          >
            {s.replaceAll("_", " ")}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto border hairline bg-[var(--paper)]">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-[#e9e5dc] text-xs uppercase tracking-[.1em]">
            <tr>
              <th className="p-4">Pedido</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Ciudad</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => {
              const totalUnits =
                order.order_items?.reduce(
                  (sum: number, item: { quantity: number }) => sum + item.quantity,
                  0
                ) ?? 0;
              const displayTotal = order.total || order.subtotal;

              return (
                <tr key={order.id} className="border-t hairline transition hover:bg-black/[0.01]">
                  <td className="p-4">
                    <Link
                      className="font-bold underline"
                      href={`/admin/pedidos/${order.id}`}
                    >
                      {order.order_number}
                    </Link>
                    <p className="muted mt-1 text-xs">
                      {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="muted text-xs">{order.phone}</p>
                  </td>
                  <td className="p-4">{order.city}</td>
                  <td className="p-4 muted text-xs">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="p-4 text-xs font-bold">
                    <span
                      className={`pill ${
                        order.status === "CONFIRMADO" || order.status === "PAGADO"
                          ? "bg-[var(--success)]"
                          : order.status === "CANCELADO"
                          ? "bg-[var(--danger)]"
                          : "bg-[var(--muted)]"
                      }`}
                    >
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">
                    {formatCurrency(displayTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!orders?.length && (
          <p className="muted p-10 text-center">
            No encontramos pedidos con estos criterios.
          </p>
        )}
      </div>
    </>
  );
}
