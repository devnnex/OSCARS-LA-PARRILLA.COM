-- Oscar's Parrilla - menu/admin sync hardening
-- Safe to run more than once.
-- This migration does not drop tables, truncate data, or delete rows.

begin;

create extension if not exists pgcrypto;

-- 1) Core tables used by admin.html and index.html.
create table if not exists public.products (
  producto_id text primary key default ('prod-' || gen_random_uuid()::text),
  categoria_id text not null default 'general',
  nombre text not null,
  precio integer not null default 0,
  descripcion text not null default '',
  imagen text not null default '',
  opciones jsonb not null default '[]'::jsonb,
  sabores jsonb not null default '[]'::jsonb,
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.extras (
  extra_id text primary key default ('extra-' || gen_random_uuid()::text),
  nombre text not null,
  precio integer not null default 0,
  imagen text not null default '',
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  setting_key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  category_id text primary key,
  nombre text not null,
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.category_covers (
  category_id text primary key references public.menu_categories(category_id),
  image_url text not null,
  storage_path text not null default '',
  alt_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Add missing columns on databases created with an older script.
alter table public.products add column if not exists categoria_id text default 'general';
alter table public.products add column if not exists nombre text default 'Producto Oscar''s Parrilla';
alter table public.products add column if not exists precio integer default 0;
alter table public.products add column if not exists descripcion text default '';
alter table public.products add column if not exists imagen text default '';
alter table public.products add column if not exists opciones jsonb default '[]'::jsonb;
alter table public.products add column if not exists sabores jsonb default '[]'::jsonb;
alter table public.products add column if not exists orden integer default 0;
alter table public.products add column if not exists activo boolean default true;
alter table public.products add column if not exists created_at timestamptz default now();
alter table public.products add column if not exists updated_at timestamptz default now();

alter table public.extras add column if not exists nombre text default 'Extra';
alter table public.extras add column if not exists precio integer default 0;
alter table public.extras add column if not exists imagen text default '';
alter table public.extras add column if not exists orden integer default 0;
alter table public.extras add column if not exists activo boolean default true;
alter table public.extras add column if not exists created_at timestamptz default now();
alter table public.extras add column if not exists updated_at timestamptz default now();

alter table public.business_settings add column if not exists updated_at timestamptz default now();
alter table public.business_settings add column if not exists value jsonb default '{}'::jsonb;
alter table public.menu_categories add column if not exists created_at timestamptz default now();
alter table public.menu_categories add column if not exists updated_at timestamptz default now();
alter table public.category_covers add column if not exists created_at timestamptz default now();
alter table public.category_covers add column if not exists updated_at timestamptz default now();
alter table public.category_covers add column if not exists image_url text default '';
alter table public.category_covers add column if not exists storage_path text default '';
alter table public.category_covers add column if not exists alt_text text default '';

-- 3) Backfill nulls safely before enforcing defaults.
update public.products
set
  categoria_id = coalesce(nullif(btrim(categoria_id), ''), 'general'),
  nombre = coalesce(nullif(btrim(nombre), ''), 'Producto Oscar''s Parrilla'),
  precio = coalesce(precio, 0),
  descripcion = coalesce(descripcion, ''),
  imagen = coalesce(imagen, ''),
  opciones = coalesce(opciones, '[]'::jsonb),
  sabores = coalesce(sabores, '[]'::jsonb),
  orden = coalesce(orden, 0),
  activo = coalesce(activo, true),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where categoria_id is null
   or btrim(categoria_id) = ''
   or nombre is null
   or btrim(nombre) = ''
   or precio is null
   or descripcion is null
   or imagen is null
   or opciones is null
   or sabores is null
   or orden is null
   or activo is null
   or created_at is null
   or updated_at is null;

update public.extras
set
  nombre = coalesce(nullif(btrim(nombre), ''), 'Extra'),
  precio = coalesce(precio, 0),
  imagen = coalesce(imagen, ''),
  orden = coalesce(orden, 0),
  activo = coalesce(activo, true),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where nombre is null
   or btrim(nombre) = ''
   or precio is null
   or imagen is null
   or orden is null
   or activo is null
   or created_at is null
   or updated_at is null;

-- Product/extra images must come from Supabase/public URLs or data:image values.
-- Local repo paths such as pizza4.png or ./images/foo.png are intentionally cleared.
update public.products
set imagen = '', updated_at = now()
where coalesce(nullif(btrim(imagen), ''), '') <> ''
  and imagen !~* '^(https?://|data:image/)';

update public.extras
set imagen = '', updated_at = now()
where coalesce(nullif(btrim(imagen), ''), '') <> ''
  and imagen !~* '^(https?://|data:image/)';

update public.business_settings
set
  value = coalesce(value, '{}'::jsonb),
  updated_at = coalesce(updated_at, now())
where value is null
   or updated_at is null;

update public.menu_categories
set
  nombre = coalesce(nullif(btrim(nombre), ''), initcap(replace(category_id, '-', ' '))),
  orden = coalesce(orden, 0),
  activo = coalesce(activo, true),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where nombre is null
   or btrim(nombre) = ''
   or orden is null
   or activo is null
   or created_at is null
   or updated_at is null;

update public.category_covers
set
  image_url = coalesce(image_url, ''),
  storage_path = coalesce(storage_path, ''),
  alt_text = coalesce(alt_text, initcap(replace(category_id, '-', ' '))),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where image_url is null
   or storage_path is null
   or alt_text is null
   or created_at is null
   or updated_at is null;

-- 4) Defaults and basic new-write protection.
alter table public.products alter column categoria_id set default 'general';
alter table public.products alter column nombre set default 'Producto Oscar''s Parrilla';
alter table public.products alter column precio set default 0;
alter table public.products alter column descripcion set default '';
alter table public.products alter column imagen set default '';
alter table public.products alter column opciones set default '[]'::jsonb;
alter table public.products alter column sabores set default '[]'::jsonb;
alter table public.products alter column orden set default 0;
alter table public.products alter column activo set default true;
alter table public.products alter column created_at set default now();
alter table public.products alter column updated_at set default now();

alter table public.extras alter column nombre set default 'Extra';
alter table public.extras alter column precio set default 0;
alter table public.extras alter column imagen set default '';
alter table public.extras alter column orden set default 0;
alter table public.extras alter column activo set default true;
alter table public.extras alter column created_at set default now();
alter table public.extras alter column updated_at set default now();

alter table public.business_settings alter column value set default '{}'::jsonb;
alter table public.business_settings alter column updated_at set default now();
alter table public.menu_categories alter column orden set default 0;
alter table public.menu_categories alter column activo set default true;
alter table public.menu_categories alter column created_at set default now();
alter table public.menu_categories alter column updated_at set default now();
alter table public.category_covers alter column storage_path set default '';
alter table public.category_covers alter column alt_text set default '';
alter table public.category_covers alter column image_url set default '';
alter table public.category_covers alter column created_at set default now();
alter table public.category_covers alter column updated_at set default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'oscars_products_precio_nonnegative') then
    alter table public.products
      add constraint oscars_products_precio_nonnegative check (precio >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'oscars_extras_precio_nonnegative') then
    alter table public.extras
      add constraint oscars_extras_precio_nonnegative check (precio >= 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'oscars_products_imagen_public_url_or_empty') then
    alter table public.products
      add constraint oscars_products_imagen_public_url_or_empty
      check (coalesce(nullif(btrim(imagen), ''), '') = '' or imagen ~* '^(https?://|data:image/)')
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'oscars_extras_imagen_public_url_or_empty') then
    alter table public.extras
      add constraint oscars_extras_imagen_public_url_or_empty
      check (coalesce(nullif(btrim(imagen), ''), '') = '' or imagen ~* '^(https?://|data:image/)')
      not valid;
  end if;
end; $$;

-- 5) The operation config exists, but existing values always win over defaults.
insert into public.business_settings (setting_key, value, updated_at)
values (
  'operation_config',
  jsonb_build_object(
    'packagingFee', 1000,
    'qrImage', '',
    'categoryCovers', jsonb_build_array(),
    'paymentMethods', jsonb_build_array(),
    'deliveryZones', jsonb_build_array()
  ),
  now()
)
on conflict (setting_key) do update
set
  value = excluded.value || public.business_settings.value,
  updated_at = now();

-- 6) Keep updated_at correct on every admin write.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'oscars_products_touch_updated_at') then
    create trigger oscars_products_touch_updated_at
    before update on public.products
    for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'oscars_extras_touch_updated_at') then
    create trigger oscars_extras_touch_updated_at
    before update on public.extras
    for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'oscars_business_settings_touch_updated_at') then
    create trigger oscars_business_settings_touch_updated_at
    before update on public.business_settings
    for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'oscars_menu_categories_touch_updated_at') then
    create trigger oscars_menu_categories_touch_updated_at
    before update on public.menu_categories
    for each row execute function public.touch_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'oscars_category_covers_touch_updated_at') then
    create trigger oscars_category_covers_touch_updated_at
    before update on public.category_covers
    for each row execute function public.touch_updated_at();
  end if;
end; $$;

-- 7) Keep menu_categories aligned with products for cover management.
create or replace function public.oscars_sync_menu_category_from_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_category_id text;
  next_name text;
begin
  next_category_id := coalesce(nullif(btrim(new.categoria_id), ''), 'general');
  next_name := initcap(replace(next_category_id, '-', ' '));

  insert into public.menu_categories (category_id, nombre, orden, activo, updated_at)
  values (next_category_id, next_name, coalesce(new.orden, 0), coalesce(new.activo, true), now())
  on conflict (category_id) do update
  set
    nombre = coalesce(nullif(public.menu_categories.nombre, ''), excluded.nombre),
    orden = least(coalesce(public.menu_categories.orden, excluded.orden), excluded.orden),
    activo = public.menu_categories.activo or excluded.activo,
    updated_at = now();

  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'oscars_products_sync_menu_category') then
    create trigger oscars_products_sync_menu_category
    after insert or update of categoria_id, orden, activo on public.products
    for each row execute function public.oscars_sync_menu_category_from_product();
  end if;
end; $$;

insert into public.menu_categories (category_id, nombre, orden, activo, updated_at)
select
  p.categoria_id,
  initcap(replace(p.categoria_id, '-', ' ')),
  min(coalesce(p.orden, 0)),
  bool_or(coalesce(p.activo, true)),
  now()
from public.products p
where p.categoria_id is not null
  and btrim(p.categoria_id) <> ''
group by p.categoria_id
on conflict (category_id) do update
set
  orden = least(public.menu_categories.orden, excluded.orden),
  activo = public.menu_categories.activo or excluded.activo,
  updated_at = now();

-- 8) Indexes for fast admin/menu reads.
create index if not exists oscars_products_active_order_idx
  on public.products (activo, categoria_id, orden, nombre);

create index if not exists oscars_products_updated_at_idx
  on public.products (updated_at desc);

create index if not exists oscars_extras_active_order_idx
  on public.extras (activo, orden, nombre);

create index if not exists oscars_extras_updated_at_idx
  on public.extras (updated_at desc);

create index if not exists oscars_business_settings_updated_at_idx
  on public.business_settings (updated_at desc);

create index if not exists oscars_category_covers_updated_at_idx
  on public.category_covers (updated_at desc);

create index if not exists oscars_menu_categories_active_order_idx
  on public.menu_categories (activo, orden, nombre);

-- 9) One source of truth payload for the public menu.
create or replace function public.oscars_menu_last_changed_at()
returns timestamptz
language sql
stable
set search_path = public
as $$
  select greatest(
    coalesce((select max(updated_at) from public.products), 'epoch'::timestamptz),
    coalesce((select max(updated_at) from public.extras), 'epoch'::timestamptz),
    coalesce((select max(updated_at) from public.business_settings), 'epoch'::timestamptz),
    coalesce((select max(updated_at) from public.menu_categories), 'epoch'::timestamptz),
    coalesce((select max(updated_at) from public.category_covers), 'epoch'::timestamptz)
  )
$$;

create or replace view public.menu_view as
select
  (select coalesce(jsonb_agg(to_jsonb(p) order by p.orden, p.nombre), '[]'::jsonb)
   from public.products p
   where p.activo) as products,
  (select coalesce(jsonb_agg(to_jsonb(e) order by e.orden, e.nombre), '[]'::jsonb)
   from public.extras e
   where e.activo) as extras,
  (select coalesce(jsonb_agg(to_jsonb(c) order by c.updated_at desc), '[]'::jsonb)
   from public.category_covers c) as category_covers,
  (select coalesce((select value from public.business_settings where setting_key = 'operation_config' limit 1), '{}'::jsonb)) as operation_config,
  public.oscars_menu_last_changed_at() as updated_at;

create or replace view public.oscars_storefront_menu_v1 as
select
  products,
  extras,
  category_covers,
  operation_config,
  updated_at,
  jsonb_build_object(
    'products', products,
    'extras', extras,
    'categoryCovers', category_covers,
    'operationConfig', operation_config,
    'updatedAt', updated_at
  ) as payload
from public.menu_view;

create or replace function public.get_storefront_menu_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select payload from public.oscars_storefront_menu_v1 limit 1
$$;

-- 10) Diagnostics: run "select * from public.menu_sync_diagnostics;" after this migration.
create or replace view public.menu_sync_diagnostics as
select
  now() as checked_at,
  public.oscars_menu_last_changed_at() as menu_last_changed_at,
  (select count(*) from public.products) as products_total,
  (select count(*) from public.products where activo) as products_active,
  (select count(*) from public.products where activo and coalesce(nullif(btrim(imagen), ''), '') = '') as active_products_without_image,
  (select max(updated_at) from public.products) as products_last_update,
  (select count(*) from public.extras) as extras_total,
  (select count(*) from public.extras where activo) as extras_active,
  (select max(updated_at) from public.extras) as extras_last_update,
  (select count(*) from public.menu_categories) as categories_total,
  (select count(*) from public.category_covers) as category_covers_total,
  (select max(updated_at) from public.business_settings where setting_key = 'operation_config') as operation_config_last_update,
  (select count(*) from public.products where updated_at is null) as products_missing_updated_at,
  (select count(*) from public.extras where updated_at is null) as extras_missing_updated_at;

-- 11) Grants for the anon key used by the current frontend adapter.
grant select on public.menu_view to anon, authenticated;
grant select on public.oscars_storefront_menu_v1 to anon, authenticated;
grant select on public.menu_sync_diagnostics to anon, authenticated;
grant execute on function public.get_storefront_menu_v1() to anon, authenticated;
grant execute on function public.oscars_menu_last_changed_at() to anon, authenticated;

-- 12) RLS compatibility with the current browser-based app.
alter table public.products enable row level security;
alter table public.extras enable row level security;
alter table public.business_settings enable row level security;
alter table public.menu_categories enable row level security;
alter table public.category_covers enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'oscars_public_read_active_products') then
    create policy oscars_public_read_active_products on public.products
    for select using (activo = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'oscars_anon_manage_products') then
    create policy oscars_anon_manage_products on public.products
    for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'extras' and policyname = 'oscars_public_read_active_extras') then
    create policy oscars_public_read_active_extras on public.extras
    for select using (activo = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'extras' and policyname = 'oscars_anon_manage_extras') then
    create policy oscars_anon_manage_extras on public.extras
    for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'business_settings' and policyname = 'oscars_anon_manage_business_settings') then
    create policy oscars_anon_manage_business_settings on public.business_settings
    for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'menu_categories' and policyname = 'oscars_public_read_active_menu_categories') then
    create policy oscars_public_read_active_menu_categories on public.menu_categories
    for select using (activo = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'menu_categories' and policyname = 'oscars_anon_manage_menu_categories') then
    create policy oscars_anon_manage_menu_categories on public.menu_categories
    for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'category_covers' and policyname = 'oscars_public_read_category_covers') then
    create policy oscars_public_read_category_covers on public.category_covers
    for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'category_covers' and policyname = 'oscars_anon_manage_category_covers') then
    create policy oscars_anon_manage_category_covers on public.category_covers
    for all using (true) with check (true);
  end if;
end; $$;

-- 13) Storage bucket/policies used by product and cover images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'oscars_public_read_product_images') then
    create policy oscars_public_read_product_images on storage.objects
    for select using (bucket_id = 'product-images');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'oscars_anon_upload_product_images') then
    create policy oscars_anon_upload_product_images on storage.objects
    for insert with check (bucket_id = 'product-images');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'oscars_anon_update_product_images') then
    create policy oscars_anon_update_product_images on storage.objects
    for update using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'oscars_anon_delete_product_images') then
    create policy oscars_anon_delete_product_images on storage.objects
    for delete using (bucket_id = 'product-images');
  end if;
end; $$;

-- 14) Prepare tables for Supabase Realtime. The app can still poll; this makes the DB ready.
alter table public.products replica identity full;
alter table public.extras replica identity full;
alter table public.business_settings replica identity full;
alter table public.menu_categories replica identity full;
alter table public.category_covers replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.products;
  exception when duplicate_object then null;
            when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.extras;
  exception when duplicate_object then null;
            when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.business_settings;
  exception when duplicate_object then null;
            when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.menu_categories;
  exception when duplicate_object then null;
            when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.category_covers;
  exception when duplicate_object then null;
            when undefined_object then null;
  end;
end; $$;

notify pgrst, 'reload schema';

commit;

-- Quick post-run check.
select * from public.menu_sync_diagnostics;
