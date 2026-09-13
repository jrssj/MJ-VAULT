import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  Calendar,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const [productsRes, ordersRes, recentRes, orderItemsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, active, stock, cost, price, low_stock_threshold, product_variants(stock)"),
    supabase
      .from("orders")
      .select("id, status, subtotal, total, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, subtotal, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("order_items")
      .select("product_name_snapshot, quantity, unit_price, subtotal")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const products = productsRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const recentOrders = recentRes.data ?? [];
  const orderItems = orderItemsRes.data ?? [];

  // Helper para stock total
  const getProductStock = (p: {
    stock: number;
    product_variants?: { stock: number }[];
  }) =>
    p.product_variants?.length
      ? p.product_variants.reduce((sum, v) => sum + v.stock, 0)
      : p.stock;

  const activeProducts = products.filter((p) => p.active);
  const soldOutProducts = products.filter((p) => getProductStock(p) === 0);
  const lowStockProducts = products.filter((p) => {
    const s = getProductStock(p);
    return s > 0 && s <= p.low_stock_threshold;
  });

  // Fechas para cálculos
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Pedidos válidos (no cancelados)
  const validOrders = orders.filter((o) => o.status !== "CANCELADO");
  const pendingOrders = orders.filter((o) => o.status === "PENDIENTE_CONTACTO");

  const todaySales = validOrders
    .filter((o) => new Date(o.created_at).getTime() >= startOfDay)
    .reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0);

  const monthSales = validOrders
    .filter((o) => new Date(o.created_at).getTime() >= startOfMonth)
    .reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0);

  const averageTicket =
    validOrders.length > 0
      ? Math.round(
          validOrders.reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0) /
            validOrders.length
        )
      : 0;

  // Productos más vendidos a partir de order_items
  const salesByProduct: Record<string, { name: string; units: number; revenue: number }> = {};
  for (const item of orderItems) {
    const key = item.product_name_snapshot;
    if (!salesByProduct[key]) {
      salesByProduct[key] = { name: key, units: 0, revenue: 0 };
    }
    salesByProduct[key].units += item.quantity;
    salesByProduct[key].revenue += item.subtotal;
  }
  const topProducts = Object.values(salesByProduct)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const primaryMetrics = [
    ["Ventas del mes", formatCurrency(monthSales), DollarSign],
    ["Ventas de hoy", formatCurrency(todaySales), Calendar],
    ["Pedidos pendientes", pendingOrders.length, ShoppingBag],
    ["Ticket promedio", formatCurrency(averageTicket), TrendingUp],
  ] as const;

  const inventoryMetrics = [
    ["Productos activos", activeProducts.length, PackageCheck],
    ["Agotados", soldOutProducts.length, AlertTriangle],
    ["Poco stock", lowStockProducts.length, AlertTriangle],
    ["Total productos", products.length, Boxes],
  ] as const;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[var(--gold)]">Resumen comercial</p>
          <h1 className="display mt-2 text-5xl">Dashboard</h1>
          <p className="muted mt-2 text-sm">
            Monitorea el desempeño en tiempo real y el estado del inventario.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/pedidos" className="button-secondary">
            Ver pedidos
          </Link>
          <Link href="/admin/productos/nuevo" className="button-primary">
            Agregar producto
          </Link>
        </div>
      </div>

      {/* Métricas Principales de Ventas */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map(([label, value, Icon]) => (
          <div key={label} className="border hairline bg-[var(--paper)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                {label}
              </span>
              <Icon size={18} className="text-[var(--gold)]" />
            </div>
            <p className="display mt-4 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {/* Métricas de Inventario */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {inventoryMetrics.map(([label, value, Icon]) => (
          <div key={label} className="border hairline bg-[var(--paper)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">{label}</span>
              <Icon size={16} className="text-[var(--gold)]" />
            </div>
            <p className="display mt-2 text-2xl">{value}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        {/* Últimos Pedidos */}
        <section className="border hairline bg-[var(--paper)]">
          <div className="flex items-center justify-between border-b hairline p-5">
            <h2 className="display text-2xl md:text-3xl">Últimos pedidos</h2>
            <Link className="text-xs font-semibold uppercase tracking-wider underline" href="/admin/pedidos">
              Ver todos ({orders.length})
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-[#ece8df] text-xs uppercase tracking-[.1em]">
                <tr>
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t hairline">
                    <td className="p-4">
                      <Link className="font-bold underline" href={`/admin/pedidos/${order.id}`}>
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4 muted text-xs">{formatDate(order.created_at)}</td>
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
                      {formatCurrency(order.total || order.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recentOrders.length && (
              <p className="muted p-8 text-center">Aún no hay pedidos registrados.</p>
            )}
          </div>
        </section>

        {/* Productos Más Vendidos */}
        <section className="border hairline bg-[var(--paper)]">
          <div className="border-b hairline p-5">
            <h2 className="display text-2xl md:text-3xl">Más vendidos</h2>
            <p className="muted mt-1 text-xs">Piezas con mayor volumen en pedidos recientes</p>
          </div>
          <div className="p-5">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between border-b hairline pb-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center bg-[#12110f] text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                        <p className="muted text-xs">{p.units} {p.units === 1 ? "unidad vendida" : "unidades vendidas"}</p>
                      </div>
                    </div>
                    <span className="font-medium text-sm whitespace-nowrap">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted py-8 text-center text-sm">
                No hay suficientes datos de venta para clasificar los productos.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
