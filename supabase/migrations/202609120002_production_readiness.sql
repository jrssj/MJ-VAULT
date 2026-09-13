-- 202609120002_production_readiness.sql
-- Zonas de envío, campos de envío en pedidos, y operaciones transaccionales.

-- 1. Tabla de zonas de envío
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  price integer not null default 0 check (price >= 0),
  free_shipping_threshold integer check (free_shipping_threshold is null or free_shipping_threshold >= 0),
  active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger shipping_zones_updated_at before update on public.shipping_zones
for each row execute function public.set_updated_at();

alter table public.shipping_zones enable row level security;

create policy "Public reads active shipping zones" on public.shipping_zones
  for select using (active or public.is_admin());

create policy "Admins manage shipping zones" on public.shipping_zones
  for all using (public.is_admin()) with check (public.is_admin());

-- 2. Modificaciones a la tabla orders para soportar envíos y totales
alter table public.orders
  add column if not exists shipping_cost integer not null default 0 check (shipping_cost >= 0),
  add column if not exists shipping_zone_id uuid references public.shipping_zones(id) on delete set null,
  add column if not exists shipping_zone_name text,
  add column if not exists total integer not null default 0 check (total >= 0);

-- Actualizar órdenes pasadas para que total = subtotal
update public.orders set total = subtotal + coalesce(shipping_cost, 0) where total = 0 and subtotal > 0;

-- 3. Zonas de envío iniciales para Colombia
insert into public.shipping_zones (name, price, active, sort_order)
values
  ('Bucaramanga', 15, true, 1),
  ('Floridablanca', 15, true, 2),
  ('Girón', 15, true, 3),
  ('Piedecuesta', 15, true, 4),
  ('Resto de Colombia', 25, true, 5)
on conflict do nothing;

-- 4. Actualización segura y transaccional de create_store_order
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
  order_shipping_cost integer := 0;
  order_total integer := 0;
  target_shipping_zone public.shipping_zones;
  zone_id_input text;
  zone_name_input text;
  recent_attempts integer;
  primary_image text;
begin
  if jsonb_array_length(cart_items) = 0 or jsonb_array_length(cart_items) > 50 then
    raise exception 'INVALID_CART';
  end if;

  select count(*) into recent_attempts from public.checkout_attempts
  where checkout_attempts.rate_key = create_store_order.rate_key
    and created_at > now() - interval '1 hour';
  if recent_attempts >= 10 then raise exception 'RATE_LIMIT'; end if;
  insert into public.checkout_attempts(rate_key) values (rate_key);

  -- Validar zona de envío si viene en customer
  zone_id_input := customer->>'shippingZoneId';
  if zone_id_input is not null and zone_id_input ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select * into target_shipping_zone from public.shipping_zones
    where id = zone_id_input::uuid and active;
  end if;

  if target_shipping_zone.id is not null then
    order_shipping_cost := target_shipping_zone.price;
    zone_name_input := target_shipping_zone.name;
  else
    order_shipping_cost := 0;
    zone_name_input := coalesce(customer->>'shippingZoneName', 'Por confirmar');
  end if;

  insert into public.orders (
    customer_name, phone, city, department, address, neighborhood,
    notes, delivery_method, subtotal, shipping_cost, shipping_zone_id,
    shipping_zone_name, total
  ) values (
    left(trim(customer->>'customerName'), 100),
    left(trim(customer->>'phone'), 20),
    left(trim(customer->>'city'), 80),
    left(trim(customer->>'department'), 80),
    left(trim(customer->>'address'), 180),
    left(trim(customer->>'neighborhood'), 100),
    left(trim(coalesce(customer->>'notes', '')), 500),
    left(trim(coalesce(customer->>'deliveryMethod', 'Envío a domicilio')), 80),
    0,
    order_shipping_cost,
    target_shipping_zone.id,
    zone_name_input,
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

  -- Comprobar si aplica envío gratuito por monto
  if target_shipping_zone.free_shipping_threshold is not null and order_subtotal >= target_shipping_zone.free_shipping_threshold then
    order_shipping_cost := 0;
  end if;

  order_total := order_subtotal + order_shipping_cost;

  update public.orders set
    subtotal = order_subtotal,
    shipping_cost = order_shipping_cost,
    total = order_total
  where id = new_order.id;

  return jsonb_build_object(
    'id', new_order.id,
    'orderNumber', new_order.order_number,
    'subtotal', order_subtotal,
    'shippingCost', order_shipping_cost,
    'shippingZoneName', zone_name_input,
    'total', order_total
  );
end;
$$;

-- 5. RPC transaccional para creación y actualización de productos desde el panel administrativo
create or replace function public.admin_upsert_product(
  product_data jsonb,
  images_data jsonb,
  variants_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  target_slug text;
  img jsonb;
  img_index integer := 0;
  v jsonb;
  v_id uuid;
  incoming_variant_ids uuid[] := array[]::uuid[];
begin
  if not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;

  target_slug := lower(trim(product_data->>'slug'));

  if product_data->>'id' is not null and (product_data->>'id') <> '' then
    target_id := (product_data->>'id')::uuid;
    update public.products set
      name = trim(product_data->>'name'),
      slug = target_slug,
      short_description = nullif(trim(product_data->>'short_description'), ''),
      description = nullif(trim(product_data->>'description'), ''),
      details = nullif(trim(product_data->>'details'), ''),
      category_id = case when product_data->>'category_id' is null or product_data->>'category_id' = '' then null else (product_data->>'category_id')::uuid end,
      price = (product_data->>'price')::integer,
      compare_at_price = case when product_data->>'compare_at_price' is null or product_data->>'compare_at_price' = '' then null else (product_data->>'compare_at_price')::integer end,
      cost = case when product_data->>'cost' is null or product_data->>'cost' = '' then null else (product_data->>'cost')::integer end,
      sku = nullif(trim(product_data->>'sku'), ''),
      stock = (product_data->>'stock')::integer,
      low_stock_threshold = coalesce((product_data->>'low_stock_threshold')::integer, 3),
      active = coalesce((product_data->>'active')::boolean, false),
      featured = coalesce((product_data->>'featured')::boolean, false),
      is_new = coalesce((product_data->>'is_new')::boolean, false),
      on_sale = coalesce((product_data->>'on_sale')::boolean, false),
      updated_at = now()
    where id = target_id;
  else
    insert into public.products (
      name, slug, short_description, description, details, category_id,
      price, compare_at_price, cost, sku, stock, low_stock_threshold,
      active, featured, is_new, on_sale
    ) values (
      trim(product_data->>'name'),
      target_slug,
      nullif(trim(product_data->>'short_description'), ''),
      nullif(trim(product_data->>'description'), ''),
      nullif(trim(product_data->>'details'), ''),
      case when product_data->>'category_id' is null or product_data->>'category_id' = '' then null else (product_data->>'category_id')::uuid end,
      (product_data->>'price')::integer,
      case when product_data->>'compare_at_price' is null or product_data->>'compare_at_price' = '' then null else (product_data->>'compare_at_price')::integer end,
      case when product_data->>'cost' is null or product_data->>'cost' = '' then null else (product_data->>'cost')::integer end,
      nullif(trim(product_data->>'sku'), ''),
      (product_data->>'stock')::integer,
      coalesce((product_data->>'low_stock_threshold')::integer, 3),
      coalesce((product_data->>'active')::boolean, false),
      coalesce((product_data->>'featured')::boolean, false),
      coalesce((product_data->>'is_new')::boolean, false),
      coalesce((product_data->>'on_sale')::boolean, false)
    ) returning id into target_id;
  end if;

  -- Reemplazar imágenes de manera atómica
  delete from public.product_images where product_id = target_id;
  if images_data is not null and jsonb_array_length(images_data) > 0 then
    for img in select * from jsonb_array_elements(images_data) loop
      insert into public.product_images (
        product_id, image_url, alt_text, sort_order, is_primary
      ) values (
        target_id,
        img->>'image_url',
        nullif(trim(img->>'alt_text'), ''),
        img_index,
        img_index = 0
      );
      img_index := img_index + 1;
    end loop;
  end if;

  -- Sincronizar variantes preservando IDs existentes
  if variants_data is not null and jsonb_array_length(variants_data) > 0 then
    for v in select * from jsonb_array_elements(variants_data) loop
      if v->>'id' is not null and (v->>'id') <> '' and (v->>'id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        v_id := (v->>'id')::uuid;
        update public.product_variants set
          size = nullif(trim(v->>'size'), ''),
          color = nullif(trim(v->>'color'), ''),
          sku = trim(v->>'sku'),
          stock = (v->>'stock')::integer,
          active = coalesce((v->>'active')::boolean, true),
          updated_at = now()
        where id = v_id and product_id = target_id;
      else
        insert into public.product_variants (
          product_id, size, color, sku, stock, active
        ) values (
          target_id,
          nullif(trim(v->>'size'), ''),
          nullif(trim(v->>'color'), ''),
          trim(v->>'sku'),
          (v->>'stock')::integer,
          coalesce((v->>'active')::boolean, true)
        ) returning id into v_id;
      end if;
      incoming_variant_ids := array_append(incoming_variant_ids, v_id);
    end loop;

    -- Eliminar variantes que ya no están en la lista
    delete from public.product_variants
    where product_id = target_id
      and id <> all(incoming_variant_ids);
  else
    delete from public.product_variants where product_id = target_id;
  end if;

  return jsonb_build_object('id', target_id, 'slug', target_slug);
end;
$$;

revoke all on function public.admin_upsert_product(jsonb, jsonb, jsonb) from public;
grant execute on function public.admin_upsert_product(jsonb, jsonb, jsonb) to authenticated;
