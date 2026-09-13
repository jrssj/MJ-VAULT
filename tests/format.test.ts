import test from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, slugify } from "../src/lib/format.ts";

test("formatCurrency formats whole numbers in USD correctly", () => {
  assert.equal(formatCurrency(230), "$230.00");
  assert.equal(formatCurrency(285), "$285.00");
  assert.equal(formatCurrency(685), "$685.00");
  assert.equal(formatCurrency(700), "$700.00");
});

test("formatCurrency handles zero and falsy/nullish values safely", () => {
  assert.equal(formatCurrency(0), "$0.00");
  assert.equal(formatCurrency(null), "$0.00");
  assert.equal(formatCurrency(undefined), "$0.00");
  assert.equal(formatCurrency(Number.NaN), "$0.00");
});

test("slugify creates url-safe clean slugs", () => {
  assert.equal(slugify("Belleza & Cuidado"), "belleza-cuidado");
  assert.equal(slugify("  Ropa Elegante!  "), "ropa-elegante");
  assert.equal(slugify("e.l.f. Glow Reviver"), "e-l-f-glow-reviver");
});
