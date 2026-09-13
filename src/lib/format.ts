export const DEFAULT_EXCHANGE_RATE_USD_TO_MXN = 20;

export function formatCurrency(value: number | null | undefined): string {
  const amount = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} MXN`;
}

export function formatCurrencyUSD(value: number | null | undefined): string {
  const amount = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
