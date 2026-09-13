import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json(); const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Revisa los datos del formulario y vuelve a intentarlo." }, { status: 400 });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"; const agent = request.headers.get("user-agent") ?? "unknown"; const rateKey = createHash("sha256").update(`${ip}:${agent}`).digest("hex"); const supabase = createAdminClient();
    const { items, ...customer } = parsed.data; const { data, error } = await supabase.rpc("create_store_order", { customer, cart_items: items, rate_key: rateKey });
    if (error) { const message = error.message.includes("INSUFFICIENT_STOCK") ? "Uno de los productos ya no tiene stock suficiente." : error.message.includes("RATE_LIMIT") ? "Has realizado varios intentos. Espera un momento antes de volver a probar." : "No pudimos crear el pedido. Revisa la disponibilidad e inténtalo de nuevo."; return NextResponse.json({ error: message }, { status: error.message.includes("RATE_LIMIT") ? 429 : 409 }); }
    const order = data as {
      id: string;
      orderNumber: string;
      subtotal: number;
      shippingCost?: number;
      shippingZoneName?: string;
      total?: number;
    };
    const { data: lines } = await supabase
      .from("order_items")
      .select("product_name_snapshot, variant_snapshot, quantity, unit_price, subtotal")
      .eq("order_id", order.id)
      .order("created_at");

    const { data: settings } = await supabase
      .from("store_settings")
      .select("whatsapp_number")
      .eq("id", 1)
      .single();
    const whatsapp = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (!whatsapp) {
      return NextResponse.json(
        {
          error:
            "El canal de WhatsApp aún no está configurado. Tu pedido quedó guardado; contacta a MJ Vault para continuarlo.",
          orderNumber: order.orderNumber,
        },
        { status: 503 }
      );
    }
    return NextResponse.json({
      ...order,
      shippingCost: order.shippingCost ?? 0,
      shippingZoneName: order.shippingZoneName ?? "Por confirmar",
      total: order.total ?? order.subtotal,
      items: lines ?? [],
      whatsapp: String(whatsapp).replace(/\D/g, ""),
    });
  } catch (error) {
    console.error("Order creation failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "No pudimos procesar el pedido en este momento." }, { status: 500 });
  }
}
