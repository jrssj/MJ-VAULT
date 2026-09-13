"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, productSchema } from "@/lib/validation";
import { slugify } from "@/lib/format";
import type { OrderStatus } from "@/types";

const nullable = (value: FormDataEntryValue | null) => { const clean = String(value ?? "").trim(); return clean || null; };
const bool = (value: FormDataEntryValue | null) => value === "on" || value === "true";
const integer = (value: FormDataEntryValue | null, fallback = 0) => { const parsed = Number(value); return Number.isInteger(parsed) ? parsed : fallback; };

import { cookies } from "next/headers";
import { hasSupabaseEnv } from "@/lib/env";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=credenciales");

  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === "development" && email.toLowerCase() === "admin@mjvault.com" && password === "admin123456") {
      const cookieStore = await cookies();
      cookieStore.set("mj_dev_admin_session", "true", { path: "/" });
      redirect("/admin");
    }
    redirect("/admin/login?error=credenciales");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect("/admin/login?error=credenciales");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (profile?.role !== "ADMIN") { await supabase.auth.signOut(); redirect("/admin/login?error=sin-permiso"); }
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("mj_dev_admin_session");
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function saveProductAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = nullable(formData.get("id"));
  let images: unknown = [];
  let variants: unknown = [];

  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    redirect(`/admin/productos/${id ?? "nuevo"}?error=datos`);
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") || slugify(String(formData.get("name") ?? ""))),
    short_description: nullable(formData.get("short_description")),
    description: nullable(formData.get("description")),
    details: nullable(formData.get("details")),
    category_id: nullable(formData.get("category_id")),
    price: integer(formData.get("price")),
    compare_at_price: nullable(formData.get("compare_at_price")) ? integer(formData.get("compare_at_price")) : null,
    cost: nullable(formData.get("cost")) ? integer(formData.get("cost")) : null,
    sku: nullable(formData.get("sku")),
    stock: integer(formData.get("stock")),
    low_stock_threshold: integer(formData.get("low_stock_threshold"), 3),
    active: id ? bool(formData.get("active")) : (formData.has("active") ? bool(formData.get("active")) : true),
    featured: bool(formData.get("featured")),
    is_new: bool(formData.get("is_new")),
    on_sale: bool(formData.get("on_sale")),
    images,
    variants,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/admin/productos/${id ?? "nuevo"}?error=validacion`);
  }

  const { images: imageRows, variants: variantRows, ...product } = parsed.data;

  if (!hasSupabaseEnv()) {
    redirect(`/admin/productos/${id ?? "nuevo"}?error=sin-supabase`);
  }

  // Intento transaccional mediante RPC PostgreSQL
  const rpcResult = await supabase.rpc("admin_upsert_product", {
    product_data: { ...(id ? { id } : {}), ...product },
    images_data: imageRows,
    variants_data: variantRows,
  });

  let productId = id;

  if (!rpcResult.error && rpcResult.data?.id) {
    productId = rpcResult.data.id as string;
  } else {
    // Fallback seguro si la RPC aún no ha sido aplicada en la base de datos
    const result = id
      ? await supabase.from("products").update(product).eq("id", id).select("id").single()
      : await supabase.from("products").insert(product).select("id").single();

    if (result.error || !result.data) {
      redirect(`/admin/productos/${id ?? "nuevo"}?error=guardar`);
    }

    productId = result.data.id as string;

    await supabase.from("product_images").delete().eq("product_id", productId);
    if (imageRows.length) {
      await supabase.from("product_images").insert(
        imageRows.map((image, index) => ({
          product_id: productId,
          ...image,
          sort_order: index,
          is_primary: index === 0,
        }))
      );
    }

    await supabase.from("product_variants").delete().eq("product_id", productId);
    if (variantRows.length) {
      await supabase.from("product_variants").insert(
        variantRows.map((variant) => ({
          product_id: productId,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          stock: variant.stock,
          active: variant.active,
        }))
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/admin/productos");
  if (id) {
    redirect(`/admin/productos/${productId}?saved=true`);
  } else {
    redirect("/admin/productos/nuevo?saved=true");
  }
}

export async function toggleProductAction(id: string, active: boolean) { const { supabase } = await requireAdmin(); await supabase.from("products").update({ active }).eq("id",id); revalidatePath("/tienda"); revalidatePath("/admin/productos"); }
export async function deleteProductAction(id: string) { const { supabase } = await requireAdmin(); await supabase.from("products").delete().eq("id",id); revalidatePath("/tienda"); revalidatePath("/admin/productos"); }
export async function duplicateProductAction(id: string) { const { supabase } = await requireAdmin(); const { data } = await supabase.from("products").select("*, images:product_images(*), variants:product_variants(*)").eq("id",id).single(); if (!data) return; const { images, variants } = data; const copy = { name: `${data.name} — copia`, slug: `${data.slug}-copia-${Date.now().toString().slice(-5)}`, short_description: data.short_description, description: data.description, details: data.details, category_id: data.category_id, price: data.price, compare_at_price: data.compare_at_price, cost: data.cost, sku: data.sku ? `${data.sku}-COPY-${Date.now().toString().slice(-5)}` : null, stock: data.stock, low_stock_threshold: data.low_stock_threshold, active: false, featured: data.featured, is_new: data.is_new, on_sale: data.on_sale }; const { data: inserted } = await supabase.from("products").insert(copy).select("id").single(); if (!inserted) return; if (images?.length) await supabase.from("product_images").insert(images.map((image: Record<string, unknown>) => ({ product_id: inserted.id, image_url: image.image_url, alt_text: image.alt_text, sort_order: image.sort_order, is_primary: image.is_primary }))); if (variants?.length) await supabase.from("product_variants").insert(variants.map((variant: Record<string, unknown>) => ({ product_id: inserted.id, size: variant.size, color: variant.color, stock: variant.stock, active: variant.active, sku: `${String(variant.sku)}-COPY-${Date.now().toString().slice(-5)}` }))); revalidatePath("/admin/productos"); }

export async function saveCategoryAction(formData: FormData) { const { supabase } = await requireAdmin(); const id = nullable(formData.get("id")); const parsed = categorySchema.safeParse({ name: String(formData.get("name") ?? ""), slug: String(formData.get("slug") || slugify(String(formData.get("name") ?? ""))), description: nullable(formData.get("description")), image_url: nullable(formData.get("image_url")), parent_id: nullable(formData.get("parent_id")), active: bool(formData.get("active")), sort_order: integer(formData.get("sort_order")) }); if (!parsed.success) return; if (id) await supabase.from("categories").update(parsed.data).eq("id",id); else await supabase.from("categories").insert(parsed.data); revalidatePath("/admin/categorias"); revalidatePath("/"); }
export async function deleteCategoryAction(id: string) { const { supabase } = await requireAdmin(); await supabase.from("categories").delete().eq("id",id); revalidatePath("/admin/categorias"); revalidatePath("/"); }

export async function saveShippingZoneAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = nullable(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const price = integer(formData.get("price"), 0);
  const freeThreshold = nullable(formData.get("free_shipping_threshold"));
  const active = bool(formData.get("active"));
  const sortOrder = integer(formData.get("sort_order"), 0);

  const payload = {
    name,
    price,
    free_shipping_threshold: freeThreshold ? integer(freeThreshold) : null,
    active,
    sort_order: sortOrder,
  };

  if (id) {
    await supabase.from("shipping_zones").update(payload).eq("id", id);
  } else {
    await supabase.from("shipping_zones").insert(payload);
  }

  revalidatePath("/admin/envios");
  revalidatePath("/checkout");
}

export async function deleteShippingZoneAction(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("shipping_zones").delete().eq("id", id);
  revalidatePath("/admin/envios");
  revalidatePath("/checkout");
}

const statuses: OrderStatus[] = ["PENDIENTE_CONTACTO","CONTACTADO","CONFIRMADO","PAGADO","ENVIADO","ENTREGADO","CANCELADO"];
export async function updateOrderStatusAction(id: string, formData: FormData) { const { supabase } = await requireAdmin(); const status = String(formData.get("status")) as OrderStatus; if (!statuses.includes(status)) return; await supabase.from("orders").update({ status }).eq("id",id); revalidatePath(`/admin/pedidos/${id}`); revalidatePath("/admin/pedidos"); revalidatePath("/admin"); }

export async function saveSettingsAction(formData: FormData) { const { supabase } = await requireAdmin(); const values = { store_name: String(formData.get("store_name") ?? "MJ Vault").trim().slice(0,80), whatsapp_number: nullable(formData.get("whatsapp_number")), instagram_url: nullable(formData.get("instagram_url")), tiktok_url: nullable(formData.get("tiktok_url")), hero_title: String(formData.get("hero_title") ?? "").trim().slice(0,140), hero_subtitle: String(formData.get("hero_subtitle") ?? "").trim().slice(0,240), hero_image_url: nullable(formData.get("hero_image_url")), promo_banner: nullable(formData.get("promo_banner")), show_promo_banner: bool(formData.get("show_promo_banner")), contact_email: nullable(formData.get("contact_email")), shipping_copy: nullable(formData.get("shipping_copy")), returns_policy: nullable(formData.get("returns_policy")), privacy_policy: nullable(formData.get("privacy_policy")), terms_copy: nullable(formData.get("terms_copy")) }; await supabase.from("store_settings").upsert({ id:1, ...values }); revalidatePath("/", "layout"); redirect("/admin/configuracion?saved=true"); }

