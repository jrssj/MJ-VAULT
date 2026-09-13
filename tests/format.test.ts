import test from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, formatCurrencyUSD, slugify } from "../src/lib/format.ts";

test("formatCurrency formats whole numbers in MXN correctly", () => {
  assert.equal(formatCurrency(230), "$230 MXN");
  assert.equal(formatCurrency(285), "$285 MXN");
  assert.equal(formatCurrency(685), "$685 MXN");
  assert.equal(formatCurrency(700), "$700 MXN");
  assert.equal(formatCurrency(1250), "$1,250 MXN");
});

test("formatCurrency handles zero and falsy/nullish values safely", () => {
  assert.equal(formatCurrency(0), "$0 MXN");
  assert.equal(formatCurrency(null), "$0 MXN");
  assert.equal(formatCurrency(undefined), "$0 MXN");
  assert.equal(formatCurrency(Number.NaN), "$0 MXN");
});

test("formatCurrencyUSD formats USD amounts with decimals", () => {
  assert.equal(formatCurrencyUSD(3.25), "$3.25");
  assert.equal(formatCurrencyUSD(10), "$10.00");
});

test("slugify creates url-safe clean slugs", () => {
  assert.equal(slugify("Belleza & Cuidado"), "belleza-cuidado");
  assert.equal(slugify("  Ropa Elegante!  "), "ropa-elegante");
  assert.equal(slugify("e.l.f. Glow Reviver"), "e-l-f-glow-reviver");
});
