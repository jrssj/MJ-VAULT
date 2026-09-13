create extension if not exists pgcrypto;

create type public.user_role as enum ('ADMIN');
create type public.order_status as enum (
  'PENDIENTE_CONTACTO', 'CONTACTADO', 'CONFIRMADO', 'PAGADO',
  'ENVIADO', 'ENTREGADO', 'CANCELADO'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'ADMIN',
  full_name text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text,
  description text,
  details text,
  category_id uuid references public.categories(id) on delete set null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  cost integer check (cost is null or cost >= 0),
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  active boolean not null default false,
  featured boolean not null default false,
  is_new boolean not null default false,
  on_sale boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index one_primary_image_per_product
  on public.product_images(product_id) where is_primary;

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  sku text not null unique,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint variant_has_option check (size is not null or color is not null),
  constraint unique_product_option unique nulls not distinct (product_id, size, color)
);

create sequence public.order_number_seq start 1;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'MJ-' || lpad(nextval('public.order_number_seq')::text, 6, '0')
  ),
  customer_name text not null,
  phone text not null,
  city text not null,
  department text not null,
  address text not null,
  neighborhood text not null,
  notes text,
  delivery_method text not null default 'Envío a domicilio',
  subtotal integer not null check (subtotal >= 0),
  status public.order_status not null default 'PENDIENTE_CONTACTO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_snapshot jsonb not null default '{}'::jsonb,
  sku_snapshot text,
  image_snapshot text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  subtotal integer not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default 'MJ Vault',
  whatsapp_number text,
  instagram_url text,
  tiktok_url text,
  hero_title text not null default 'Más que moda, tu esencia.',
  hero_subtitle text not null default 'Piezas seleccionadas para expresar tu estilo.',
  hero_image_url text,
  promo_banner text,
  show_promo_banner boolean not null default false,
  contact_email text,
  shipping_copy text,
  returns_policy text,
  privacy_policy text,
  terms_copy text,
  updated_at timestamptz not null default now()
);

create table public.checkout_attempts (
  id bigint generated always as identity primary key,
  rate_key text not null,
  created_at timestamptz not null default now()
);

create index products_active_created_idx on public.products(active, created_at desc);
create index products_category_idx on public.products(category_id) where active;
create index products_flags_idx on public.products(featured, is_new, on_sale) where active;
create index variants_product_idx on public.product_variants(product_id) where active;
create index orders_created_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(status, created_at desc);
create index checkout_attempts_rate_idx on public.checkout_attempts(rate_key, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger variants_updated_at before update on public.product_variants
for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.store_settings
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'ADMIN'
  );
$$;

create or replace function public.create_store_order(
  customer jsonb,
  cart_items jsonb,
  rate_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_order public.orders;
  item jsonb;
  product_row public.products;
  variant_row public.product_variants;
  item_price integer;
  item_quantity integer;
  order_subtotal integer := 0;
  recent_attempts integer;
  primary_image text;
begin
  if jsonb_array_length(cart_items) = 0 or jsonb_array_length(cart_items) > 50 then
    raise exception 'INVALID_CART';
  end if;

  select count(*) into recent_attempts from public.checkout_attempts
  where checkout_attempts.rate_key = create_store_order.rate_key
    and created_at > now() - interval '1 hour';
  if recent_attempts >= 5 then raise exception 'RATE_LIMIT'; end if;
  insert into public.checkout_attempts(rate_key) values (rate_key);

  insert into public.orders (
    customer_name, phone, city, department, address, neighborhood,
    notes, delivery_method, subtotal
  ) values (
    left(trim(customer->>'customerName'), 100),
    left(trim(customer->>'phone'), 20),
    left(trim(customer->>'city'), 80),
    left(trim(customer->>'department'), 80),
    left(trim(customer->>'address'), 180),
    left(trim(customer->>'neighborhood'), 100),
    left(trim(coalesce(customer->>'notes', '')), 500),
    left(trim(coalesce(customer->>'deliveryMethod', 'Envío a domicilio')), 80),
    0
  ) returning * into new_order;

  for item in select * from jsonb_array_elements(cart_items)
  loop
    item_quantity := (item->>'quantity')::integer;
    if item_quantity < 1 or item_quantity > 20 then raise exception 'INVALID_QUANTITY'; end if;

    select * into product_row from public.products
    where id = (item->>'productId')::uuid and active for update;
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
    item_price := product_row.price;

    if item->>'variantId' is not null then
      select * into variant_row from public.product_variants
      where id = (item->>'variantId')::uuid
        and product_id = product_row.id and active for update;
      if not found or variant_row.stock < item_quantity then raise exception 'INSUFFICIENT_STOCK'; end if;
      update public.product_variants set stock = stock - item_quantity where id = variant_row.id;
    else
      if exists (select 1 from public.product_variants where product_id = product_row.id and active) then
        raise exception 'VARIANT_REQUIRED';
      end if;
      if product_row.stock < item_quantity then raise exception 'INSUFFICIENT_STOCK'; end if;
      update public.products set stock = stock - item_quantity where id = product_row.id;
    end if;

    select image_url into primary_image from public.product_images
    where product_id = product_row.id order by is_primary desc, sort_order asc limit 1;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name_snapshot, variant_snapshot,
      sku_snapshot, image_snapshot, quantity, unit_price, subtotal
    ) values (
      new_order.id, product_row.id, variant_row.id, product_row.name,
      case when variant_row.id is null then '{}'::jsonb else jsonb_build_object('size', variant_row.size, 'color', variant_row.color) end,
      coalesce(variant_row.sku, product_row.sku), primary_image,
      item_quantity, item_price, item_price * item_quantity
    );
    order_subtotal := order_subtotal + (item_price * item_quantity);
    variant_row := null;
  end loop;

  update public.orders set subtotal = order_subtotal where id = new_order.id;
  return jsonb_build_object('id', new_order.id, 'orderNumber', new_order.order_number, 'subtotal', order_subtotal);
end;
$$;

create or replace function public.restore_cancelled_order_stock()
returns trigger language plpgsql security definer set search_path = '' as $$
declare line public.order_items;
begin
  if old.status = 'CANCELADO' and new.status <> 'CANCELADO' then
    raise exception 'CANCELLED_ORDER_IS_FINAL';
  end if;
  if old.status <> 'CANCELADO' and new.status = 'CANCELADO' then
    for line in select * from public.order_items where order_id = new.id loop
      if line.variant_id is not null then
        update public.product_variants set stock = stock + line.quantity where id = line.variant_id;
      elsif line.product_id is not null then
        update public.products set stock = stock + line.quantity where id = line.product_id;
      end if;
    end loop;
  end if;
  return new;
end;
$$;

create trigger restore_stock_after_cancel before update of status on public.orders
for each row execute function public.restore_cancelled_order_stock();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.checkout_attempts enable row level security;

create policy "Public reads active categories" on public.categories for select using (active or public.is_admin());
create policy "Public reads active products" on public.products for select using (active or public.is_admin());
create policy "Public reads images of active products" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
);
create policy "Public reads active variants" on public.product_variants for select using (
  active and exists (select 1 from public.products p where p.id = product_id and p.active) or public.is_admin()
);
create policy "Public reads settings" on public.store_settings for select using (true);
create policy "Admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

revoke all on function public.create_store_order(jsonb, jsonb, text) from public;
grant execute on function public.create_store_order(jsonb, jsonb, text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 6291456, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads product media" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins upload product media" on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins update product media" on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin());
create policy "Admins delete product media" on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

insert into public.store_settings (id) values (1) on conflict do nothing;

with beauty as (
  insert into public.categories(name, slug, description, sort_order)
  values ('Belleza', 'belleza', 'Maquillaje y esenciales de belleza seleccionados.', 1)
  returning id
), skincare as (
  insert into public.categories(name, slug, description, sort_order)
  values ('Cuidado personal', 'cuidado-personal', 'Cuidado diario para tu piel.', 2)
  returning id
), seeded(name, slug, price, image, category_slug, featured, is_new) as (
  values
    ('e.l.f. Glow Reviver Lip Oil — Red Delicious', 'elf-glow-reviver-lip-oil-red-delicious', 230, '/catalog/elf-lip-oil.png', 'belleza', true, true),
    ('e.l.f. Power Grip Primer — Clear', 'elf-power-grip-primer-clear', 285, '/catalog/elf-power-grip-primer.png', 'belleza', true, true),
    ('eos Mini Body Lotion — Vanilla Cashmere', 'eos-mini-body-lotion-vanilla-cashmere', 119, '/catalog/eos-mini-body-lotion.png', 'cuidado-personal', false, true),
    ('e.l.f. Cream Glide Lip Liner — Fuschia Forward', 'elf-cream-glide-lip-liner-fuschia-forward', 85, '/catalog/elf-lip-liner.png', 'belleza', false, true),
    ('e.l.f. Clear Brow & Lash Mascara Crystal', 'elf-clear-brow-lash-mascara-crystal', 130, '/catalog/elf-clear-brow-lash-mascara.png', 'belleza', false, false),
    ('e.l.f. Flawless Face Brush Collection — 6 piezas', 'elf-flawless-face-brush-collection', 400, '/catalog/elf-brush-collection.png', 'belleza', true, false),
    ('e.l.f. Jumbo Power Grip Primer', 'elf-jumbo-power-grip-primer', 620, '/catalog/elf-jumbo-primer.png', 'belleza', false, true),
    ('Dolce & Gabbana Mini Everfull XL Mascara', 'dolce-gabbana-mini-everfull-xl-mascara', 590, '/catalog/dg-mascara.png', 'belleza', true, true),
    ('Rare Beauty Mini Soft Pinch Liquid Blush', 'rare-beauty-mini-soft-pinch-liquid-blush', 385, '/catalog/rare-beauty-mini-blush.png', 'belleza', true, true),
    ('Rare Beauty Soft Pinch Liquid Blush', 'rare-beauty-soft-pinch-liquid-blush', 685, '/catalog/rare-beauty-blush.png', 'belleza', false, true),
    ('Rhode Pocket Bronze Long-Wearing Cream Bronzer', 'rhode-pocket-bronze-cream-bronzer', 695, '/catalog/rhode-bronzer.png', 'belleza', true, true),
    ('Starface Hydro-Star Earth Pimple Patches — 32 unidades', 'starface-hydro-star-earth-pimple-patches', 295, '/catalog/starface-patches.png', 'cuidado-personal', false, true),
    ('Hero Mighty Patch Original — 24 unidades', 'hero-mighty-patch-original', 260, '/catalog/hero-mighty-patch.png', 'cuidado-personal', true, true),
    ('Rhode Pocket Blush Buildable Hydrating Cream Blush', 'rhode-pocket-blush', 700, '/catalog/rhode-pocket-blush.png', 'belleza', true, true)
), inserted as (
  insert into public.products(name, slug, short_description, description, price, category_id, featured, is_new, active, stock)
  select s.name, s.slug, 'Selección original disponible en MJ Vault.', 'Producto del catálogo actual. Consulta disponibilidad y detalles con atención personalizada.', s.price,
    c.id, s.featured, s.is_new, true, 0
  from seeded s join public.categories c on c.slug = s.category_slug
  returning id, slug, name
)
insert into public.product_images(product_id, image_url, alt_text, sort_order, is_primary)
select i.id, s.image, i.name, 0, true
from inserted i join seeded s on s.slug = i.slug;
