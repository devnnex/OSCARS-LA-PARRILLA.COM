create extension if not exists pgcrypto;

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
  category_id text primary key references public.menu_categories(category_id) on update cascade on delete cascade,
  image_url text not null,
  storage_path text not null default '',
  alt_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_categories_active_order_idx on public.menu_categories (activo, orden, nombre);
create index if not exists category_covers_updated_at_idx on public.category_covers (updated_at desc);

insert into public.menu_categories (category_id, nombre, orden, activo)
select categoria_id, initcap(replace(categoria_id, '-', ' ')), min(orden), true
from public.products
where categoria_id is not null and categoria_id <> ''
group by categoria_id
on conflict (category_id) do update set
  nombre = excluded.nombre,
  orden = excluded.orden,
  activo = true,
  updated_at = now();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists menu_categories_touch_updated_at on public.menu_categories;
create trigger menu_categories_touch_updated_at before update on public.menu_categories
for each row execute function public.touch_updated_at();

drop trigger if exists category_covers_touch_updated_at on public.category_covers;
create trigger category_covers_touch_updated_at before update on public.category_covers
for each row execute function public.touch_updated_at();

drop trigger if exists business_settings_touch_updated_at on public.business_settings;
create trigger business_settings_touch_updated_at before update on public.business_settings
for each row execute function public.touch_updated_at();

alter table public.business_settings enable row level security;
alter table public.menu_categories enable row level security;
alter table public.category_covers enable row level security;

drop policy if exists "public read active menu categories" on public.menu_categories;
create policy "public read active menu categories" on public.menu_categories for select using (activo = true);

drop policy if exists "public read category covers" on public.category_covers;
create policy "public read category covers" on public.category_covers for select using (true);

drop policy if exists "anon manage business settings" on public.business_settings;
create policy "anon manage business settings" on public.business_settings for all using (true) with check (true);

drop policy if exists "anon manage menu categories" on public.menu_categories;
create policy "anon manage menu categories" on public.menu_categories for all using (true) with check (true);

drop policy if exists "anon manage category covers" on public.category_covers;
create policy "anon manage category covers" on public.category_covers for all using (true) with check (true);

insert into public.business_settings (setting_key, value)
values (
  'operation_config',
  jsonb_build_object(
    'packagingFee', 1000,
    'qrImage', '',
    'categoryCovers', jsonb_build_array(),
    'paymentMethods', jsonb_build_array(),
    'deliveryZones', jsonb_build_array()
  )
)
on conflict (setting_key) do nothing;

with storage_covers as (
  select
    regexp_replace(name, '^category-covers/(.*)-[0-9]+\.[^.]+$', '\1') as category_id,
    name as storage_path,
    updated_at,
    row_number() over (
      partition by regexp_replace(name, '^category-covers/(.*)-[0-9]+\.[^.]+$', '\1')
      order by updated_at desc
    ) as rn
  from storage.objects
  where bucket_id = 'product-images'
    and name like 'category-covers/%'
    and name ~ '^category-covers/.+-[0-9]+\.[^.]+$'
),
latest_covers as (
  select
    category_id,
    'https://itybnkzauqawxzvekmop.supabase.co/storage/v1/object/public/product-images/' || storage_path as image_url,
    storage_path,
    updated_at
  from storage_covers
  where rn = 1
)
insert into public.category_covers (category_id, image_url, storage_path, alt_text, updated_at)
select
  category_id,
  image_url,
  storage_path,
  initcap(replace(category_id, '-', ' ')),
  updated_at
from latest_covers
on conflict (category_id) do nothing;

with covers_json as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'category_id', category_id,
    'image_url', image_url,
    'storage_path', storage_path,
    'updated_at', updated_at
  ) order by updated_at desc), '[]'::jsonb) as covers
  from public.category_covers
)
update public.business_settings
set value = jsonb_set(value, '{categoryCovers}', (select covers from covers_json), true),
    updated_at = now()
where setting_key = 'operation_config';

drop view if exists public.menu_view;
create view public.menu_view as
select
  (select coalesce(jsonb_agg(to_jsonb(p) order by p.orden, p.nombre), '[]'::jsonb) from public.products p where p.activo) as products,
  (select coalesce(jsonb_agg(to_jsonb(e) order by e.orden, e.nombre), '[]'::jsonb) from public.extras e where e.activo) as extras,
  (select coalesce(jsonb_agg(to_jsonb(c) order by c.updated_at desc), '[]'::jsonb) from public.category_covers c) as category_covers,
  (select coalesce(value, '{}'::jsonb) from public.business_settings where setting_key = 'operation_config') as operation_config,
  now() as updated_at;

notify pgrst, 'reload schema';
