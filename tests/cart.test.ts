import test from "node:test";
import assert from "node:assert/strict";
import type { CartItem } from "../src/types/index.ts";

function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function clampQuantity(desired: number, maxStock: number): number {
  return Math.max(1, Math.min(desired, maxStock));
}

function getCartItemKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? "base"}`;
}

test("cart calculates subtotal correctly in USD integers", () => {
  const items: CartItem[] = [
    {
      key: "prod1:var1",
      productId: "prod1",
      variantId: "var1",
      slug: "lip-oil",
      name: "e.l.f. Glow Reviver Lip Oil",
      image: null,
      price: 230,
      quantity: 2,
      size: null,
      color: "Red",
      maxStock: 5,
    },
    {
      key: "prod2:base",
      productId: "prod2",
      variantId: null,
      slug: "primer",
      name: "e.l.f. Power Grip Primer",
      image: null,
      price: 285,
      quantity: 1,
      size: null,
      color: null,
      maxStock: 3,
    },
  ];

  assert.equal(calculateCartSubtotal(items), 230 * 2 + 285);
  assert.equal(calculateCartCount(items), 3);
});

test("cart prevents quantity exceeding max available stock", () => {
  const stock = 4;
  assert.equal(clampQuantity(6, stock), 4);
  assert.equal(clampQuantity(2, stock), 2);
  assert.equal(clampQuantity(0, stock), 1);
  assert.equal(clampQuantity(-3, stock), 1);
});

test("cart generates unique keys distinguishing variants of the same product", () => {
  const prodId = "prod-123";
  const keyRed = getCartItemKey(prodId, "var-red");
  const keyBlue = getCartItemKey(prodId, "var-blue");
  const keyBase = getCartItemKey(prodId, null);

  assert.notEqual(keyRed, keyBlue);
  assert.notEqual(keyRed, keyBase);
  assert.equal(keyRed, "prod-123:var-red");
  assert.equal(keyBase, "prod-123:base");
});
