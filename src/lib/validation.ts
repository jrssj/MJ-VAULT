import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(3).max(100),
  phone: z.string().trim().regex(/^[+0-9\s()-]{7,20}$/),
  city: z.string().trim().min(2).max(80),
  department: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(180),
  neighborhood: z.string().trim().max(100).optional().default("N/A"),
  addressReference: z.string().trim().max(180).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
  deliveryMethod: z.string().trim().max(80).optional().default("Envío a domicilio"),
  shippingZoneId: z.string().uuid().nullable().optional(),
  shippingZoneName: z.string().trim().max(100).nullable().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable(),
    quantity: z.number().int().min(1).max(20),
  })).min(1).max(50),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  short_description: z.string().trim().max(180).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  details: z.string().trim().max(3000).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  price: z.number().int().nonnegative(),
  compare_at_price: z.number().int().nonnegative().nullable().optional(),
  cost: z.number().int().nonnegative().nullable().optional(),
  sku: z.string().trim().max(80).nullable().optional(),
  stock: z.number().int().nonnegative(),
  low_stock_threshold: z.number().int().min(0).max(9999),
  active: z.boolean(),
  featured: z.boolean(),
  is_new: z.boolean(),
  on_sale: z.boolean(),
  images: z.array(z.object({ image_url: z.string().min(1), alt_text: z.string().max(180).nullable(), is_primary: z.boolean(), sort_order: z.number().int() })).max(12),
  variants: z.array(z.object({ id: z.string().uuid().optional(), size: z.string().max(40).nullable(), color: z.string().max(60).nullable(), sku: z.string().min(1).max(80), stock: z.number().int().nonnegative(), active: z.boolean() })).max(200),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(300).nullable().optional(),
  image_url: z.string().trim().max(1000).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export const shippingZoneSchema = z.object({
  name: z.string().trim().min(2).max(100),
  price: z.number().int().nonnegative(),
  free_shipping_threshold: z.number().int().nonnegative().nullable().optional(),
  active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

