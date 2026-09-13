import test from "node:test";
import assert from "node:assert/strict";
import { formatCurrency } from "../src/lib/format.ts";

function generateWhatsAppMessage({
  orderNumber,
  customerName,
  phone,
  city,
  department,
  address,
  neighborhood,
  addressReference,
  deliveryMethod,
  shippingZoneName,
  subtotal,
  shippingCost,
  total,
  items,
}: {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  department: string;
  address: string;
  neighborhood: string;
  addressReference?: string;
  deliveryMethod: string;
  shippingZoneName: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: { name: string; quantity: number; price: number; subtotal: number; color?: string | null; size?: string | null }[];
}) {
  const productLines = items
    .map((item) => {
      const options = [
        item.color && `Color: ${item.color}`,
        item.size && `Talla: ${item.size}`,
      ].filter(Boolean);

      return `${item.quantity}x ${item.name}${
        options.length ? `\n(${options.join(" · ")})` : ""
      }\nPrecio: ${formatCurrency(item.price)}\nSubtotal: ${formatCurrency(item.subtotal)}`;
    })
    .join("\n\n");

  const shippingLabel =
    shippingCost === 0
      ? "Gratis"
      : shippingCost > 0
      ? formatCurrency(shippingCost)
      : "Por confirmar";

  return [
    "Hola, quiero confirmar mi pedido en MJ VAULT.",
    "",
    `Pedido: #${orderNumber}`,
    "",
    "PRODUCTOS:",
    productLines,
    "",
    `Subtotal: ${formatCurrency(subtotal)}`,
    `Envío (${shippingZoneName || "Por confirmar"}): ${shippingLabel}`,
    `Total: ${formatCurrency(total)}`,
    "",
    "CLIENTE:",
    `Nombre: ${customerName}`,
    `Teléfono: ${phone}`,
    "",
    "ENTREGA:",
    `Ciudad: ${city}, ${department}`,
    `Dirección: ${address}`,
    `Barrio: ${neighborhood}`,
    addressReference ? `Referencia: ${addressReference}` : null,
    `Método: ${deliveryMethod}`,
    "",
    "Quedo a la espera de la confirmación de disponibilidad y datos para el pago.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

test("whatsapp message format contains NO emojis and formats currency in MXN", () => {
  const msg = generateWhatsAppMessage({
    orderNumber: "MJ-000123",
    customerName: "Camila Torres",
    phone: "3001234567",
    city: "Bucaramanga",
    department: "Santander",
    address: "Carrera 33 # 48-20",
    neighborhood: "Cabecera",
    deliveryMethod: "Envío a domicilio",
    shippingZoneName: "Bucaramanga",
    subtotal: 230,
    shippingCost: 15,
    total: 245,
    items: [
      {
        name: "e.l.f. Glow Reviver Lip Oil",
        quantity: 1,
        price: 230,
        subtotal: 230,
        color: "Red Delicious",
      },
    ],
  });

  // Regex to detect emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(msg), false, "Message must not contain any emoji");

  assert.ok(msg.includes("Pedido: #MJ-000123"));
  assert.ok(msg.includes("Subtotal: $230 MXN"));
  assert.ok(msg.includes("Envío (Bucaramanga): $15 MXN"));
  assert.ok(msg.includes("Total: $245 MXN"));
});

test("whatsapp message encodes properly for wa.me URL", () => {
  const msg = "Hola, pedido #MJ-000123";
  const url = `https://wa.me/573001234567?text=${encodeURIComponent(msg)}`;
  assert.ok(url.startsWith("https://wa.me/573001234567?text="));
  assert.ok(url.includes("%23MJ-000123"));
});
