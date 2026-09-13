export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  details: string | null;
  price: number;
  compare_at_price: number | null;
  cost: number | null;
  sku: string | null;
  stock: number;
  active: boolean;
  featured: boolean;
  is_new: boolean;
  on_sale: boolean;
  low_stock_threshold: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
};

export type StoreSettings = {
  id: number;
  store_name: string;
  whatsapp_number: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  promo_banner: string | null;
  show_promo_banner: boolean;
  contact_email: string | null;
  shipping_copy: string | null;
  returns_policy: string | null;
  privacy_policy: string | null;
  terms_copy: string | null;
};

export type CartItem = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  maxStock: number;
};

export type OrderStatus =
  | "PENDIENTE_CONTACTO"
  | "CONTACTADO"
  | "CONFIRMADO"
  | "PAGADO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";
