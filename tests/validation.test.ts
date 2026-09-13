import test from "node:test";
import assert from "node:assert/strict";
import {
  checkoutSchema,
  productSchema,
  categorySchema,
  shippingZoneSchema,
} from "../src/lib/validation.ts";

test("checkoutSchema validates valid checkout payload", () => {
  const payload = {
    customerName: "Camila Torres",
    phone: "+573001234567",
    city: "Bucaramanga",
    department: "Santander",
    address: "Carrera 33 # 48-20",
    neighborhood: "Cabecera",
    deliveryMethod: "Envío a domicilio",
    shippingZoneId: "550e8400-e29b-41d4-a716-446655440000",
    shippingZoneName: "Bucaramanga",
    items: [
      {
        productId: "e8b8c2d1-9b1b-4f9e-8c1d-1e1b1e1b1e1b",
        variantId: null,
        quantity: 2,
      },
    ],
  };

  const result = checkoutSchema.safeParse(payload);
  assert.equal(result.success, true);
});

test("checkoutSchema rejects empty cart or quantity > 20", () => {
  const emptyItems = {
    customerName: "Camila Torres",
    phone: "3001234567",
    city: "Bucaramanga",
    department: "Santander",
    address: "Carrera 33 # 48-20",
    neighborhood: "Cabecera",
    items: [],
  };
  assert.equal(checkoutSchema.safeParse(emptyItems).success, false);

  const excessiveQuantity = {
    ...emptyItems,
    items: [
      {
        productId: "b0000000-0000-0000-0000-000000000001",
        variantId: null,
        quantity: 25,
      },
    ],
  };
  assert.equal(checkoutSchema.safeParse(excessiveQuantity).success, false);
});

test("checkoutSchema rejects invalid phone numbers", () => {
  const invalidPhone = {
    customerName: "Camila Torres",
    phone: "abc",
    city: "Bucaramanga",
    department: "Santander",
    address: "Carrera 33 # 48-20",
    neighborhood: "Cabecera",
    items: [
      {
        productId: "b0000000-0000-0000-0000-000000000001",
        variantId: null,
        quantity: 1,
      },
    ],
  };
  assert.equal(checkoutSchema.safeParse(invalidPhone).success, false);
});

test("productSchema enforces non-negative integer prices in USD", () => {
  const validProduct = {
    name: "Vestido Seda",
    slug: "vestido-seda",
    price: 230,
    compare_at_price: 285,
    stock: 10,
    low_stock_threshold: 3,
    active: true,
    featured: false,
    is_new: true,
    on_sale: true,
    images: [],
    variants: [],
  };
  assert.equal(productSchema.safeParse(validProduct).success, true);

  const negativePrice = {
    ...validProduct,
    price: -10,
  };
  assert.equal(productSchema.safeParse(negativePrice).success, false);
});

test("shippingZoneSchema validates zone fields", () => {
  const validZone = {
    name: "Bucaramanga",
    price: 15,
    free_shipping_threshold: 300,
    active: true,
    sort_order: 1,
  };
  assert.equal(shippingZoneSchema.safeParse(validZone).success, true);

  const negativeShipping = {
    ...validZone,
    price: -5,
  };
  assert.equal(shippingZoneSchema.safeParse(negativeShipping).success, false);
});

test("categorySchema validates category slug and name", () => {
  const validCategory = {
    name: "Cuidado Personal",
    slug: "cuidado-personal",
    active: true,
    sort_order: 1,
  };
  assert.equal(categorySchema.safeParse(validCategory).success, true);

  const invalidSlug = {
    ...validCategory,
    slug: "Cuidado Personal Con Espacios",
  };
  assert.equal(categorySchema.safeParse(invalidSlug).success, false);
});
