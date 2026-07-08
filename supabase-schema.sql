create extension if not exists pgcrypto;

create table if not exists public.products (
  producto_id text primary key default ('prod-' || gen_random_uuid()::text),
  categoria_id text not null default 'general',
  nombre text not null,
  precio integer not null default 0 check (precio >= 0),
  descripcion text not null default '',
  imagen text not null default '',
  opciones jsonb not null default '[]'::jsonb,
  sabores jsonb not null default '[]'::jsonb,
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists sabores jsonb not null default '[]'::jsonb;

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

create table if not exists public.extras (
  extra_id text primary key default ('extra-' || gen_random_uuid()::text),
  nombre text not null,
  precio integer not null default 0 check (precio >= 0),
  imagen text not null default '',
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  order_id text primary key default ('ord-' || gen_random_uuid()::text),
  order_number bigint generated always as identity,
  fecha timestamptz not null default now(),
  cliente text not null,
  telefono text not null,
  metodo text not null default 'recoger',
  direccion text not null default '',
  pago text not null default '',
  subtotal integer not null default 0,
  domicilio integer not null default 0,
  total integer not null default 0,
  estado text not null default 'nuevo',
  notas text not null default '',
  items jsonb not null default '[]'::jsonb
);

alter table public.orders add column if not exists empaque integer not null default 0;
alter table public.orders add column if not exists barrio text not null default '';

create table if not exists public.business_settings (
  setting_key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.tables (
  table_id text primary key default ('mesa-' || gen_random_uuid()::text),
  nombre text not null,
  estado text not null default 'abierta',
  fecha_apertura timestamptz not null default now(),
  fecha_cierre timestamptz,
  cajero text not null default 'Caja principal',
  items jsonb not null default '[]'::jsonb,
  total integer not null default 0
);

create table if not exists public.payments (
  payment_id text primary key default ('pay-' || gen_random_uuid()::text),
  table_id text,
  table_name text not null default '',
  origen text not null default 'Mesa',
  fecha timestamptz not null default now(),
  cajero text not null default 'Caja principal',
  metodo text not null default 'Efectivo',
  metodo_principal text not null default 'Efectivo',
  metodo_uno text not null default '',
  valor_uno integer not null default 0,
  metodo_dos text not null default '',
  valor_dos integer not null default 0,
  total integer not null default 0,
  estado text not null default 'pagado',
  notas text not null default '',
  items jsonb not null default '[]'::jsonb
);

create table if not exists public.inventory (
  inventory_id text primary key default ('inv-' || gen_random_uuid()::text),
  nombre text not null,
  categoria text not null default 'General',
  cantidad numeric not null default 0,
  unidad text not null default 'unidades',
  costo integer not null default 0,
  minimo numeric not null default 0,
  activo boolean not null default true,
  actualizado timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  movement_id text primary key default ('mov-' || gen_random_uuid()::text),
  inventory_id text,
  nombre text not null default 'Insumo',
  cantidad numeric not null default 0,
  unidad text not null default '',
  tipo text not null default 'retiro',
  fecha timestamptz not null default now(),
  usuario text not null default 'Usuario'
);

create table if not exists public.cashiers (
  cashier_id text primary key default ('cash-' || gen_random_uuid()::text),
  nombre text not null,
  correo text not null unique,
  clave text not null,
  rol text not null default 'cajero',
  activo boolean not null default true,
  ultimo_acceso timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists menu_categories_touch_updated_at on public.menu_categories;
create trigger menu_categories_touch_updated_at before update on public.menu_categories
for each row execute function public.touch_updated_at();

drop trigger if exists category_covers_touch_updated_at on public.category_covers;
create trigger category_covers_touch_updated_at before update on public.category_covers
for each row execute function public.touch_updated_at();

drop trigger if exists extras_touch_updated_at on public.extras;
create trigger extras_touch_updated_at before update on public.extras
for each row execute function public.touch_updated_at();

drop trigger if exists cashiers_touch_updated_at on public.cashiers;
create trigger cashiers_touch_updated_at before update on public.cashiers
for each row execute function public.touch_updated_at();

drop trigger if exists business_settings_touch_updated_at on public.business_settings;
create trigger business_settings_touch_updated_at before update on public.business_settings
for each row execute function public.touch_updated_at();

drop view if exists public.menu_view;
create view public.menu_view as
select
  (select coalesce(jsonb_agg(to_jsonb(p) order by p.orden, p.nombre), '[]'::jsonb) from public.products p where p.activo) as products,
  (select coalesce(jsonb_agg(to_jsonb(e) order by e.orden, e.nombre), '[]'::jsonb) from public.extras e where e.activo) as extras,
  (select coalesce(jsonb_agg(to_jsonb(c) order by c.updated_at desc), '[]'::jsonb) from public.category_covers c) as category_covers,
  (select coalesce(value, '{}'::jsonb) from public.business_settings where setting_key = 'operation_config') as operation_config,
  now() as updated_at;

alter table public.products enable row level security;
alter table public.menu_categories enable row level security;
alter table public.category_covers enable row level security;
alter table public.extras enable row level security;
alter table public.orders enable row level security;
alter table public.tables enable row level security;
alter table public.payments enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.cashiers enable row level security;
alter table public.business_settings enable row level security;

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (activo = true);
drop policy if exists "public read active menu categories" on public.menu_categories;
create policy "public read active menu categories" on public.menu_categories for select using (activo = true);
drop policy if exists "public read category covers" on public.category_covers;
create policy "public read category covers" on public.category_covers for select using (true);
drop policy if exists "public read active extras" on public.extras;
create policy "public read active extras" on public.extras for select using (activo = true);
drop policy if exists "public create orders" on public.orders;
create policy "public create orders" on public.orders for insert with check (true);

drop policy if exists "anon manage products" on public.products;
create policy "anon manage products" on public.products for all using (true) with check (true);
drop policy if exists "anon manage menu categories" on public.menu_categories;
create policy "anon manage menu categories" on public.menu_categories for all using (true) with check (true);
drop policy if exists "anon manage category covers" on public.category_covers;
create policy "anon manage category covers" on public.category_covers for all using (true) with check (true);
drop policy if exists "anon manage extras" on public.extras;
create policy "anon manage extras" on public.extras for all using (true) with check (true);
drop policy if exists "anon manage orders" on public.orders;
create policy "anon manage orders" on public.orders for all using (true) with check (true);
drop policy if exists "anon manage tables" on public.tables;
create policy "anon manage tables" on public.tables for all using (true) with check (true);
drop policy if exists "anon manage payments" on public.payments;
create policy "anon manage payments" on public.payments for all using (true) with check (true);
drop policy if exists "anon manage inventory" on public.inventory;
create policy "anon manage inventory" on public.inventory for all using (true) with check (true);
drop policy if exists "anon manage inventory movements" on public.inventory_movements;
create policy "anon manage inventory movements" on public.inventory_movements for all using (true) with check (true);
drop policy if exists "anon manage cashiers" on public.cashiers;
create policy "anon manage cashiers" on public.cashiers for all using (true) with check (true);
drop policy if exists "anon manage business settings" on public.business_settings;
create policy "anon manage business settings" on public.business_settings for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
for select using (bucket_id = 'product-images');

drop policy if exists "anon upload product images" on storage.objects;
create policy "anon upload product images" on storage.objects
for insert with check (bucket_id = 'product-images');

drop policy if exists "anon update product images" on storage.objects;
create policy "anon update product images" on storage.objects
for update using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

drop policy if exists "anon delete product images" on storage.objects;
create policy "anon delete product images" on storage.objects
for delete using (bucket_id = 'product-images');

insert into public.business_settings (setting_key, value)
values (
  'operation_config',
  jsonb_build_object(
    'packagingFee', 1000,
    'qrImage', '',
    'categoryCovers', jsonb_build_array(),
    'paymentMethods', jsonb_build_array(
      jsonb_build_object('method_id', 'nequi', 'nombre', 'Nequi', 'tipo', 'transferencia', 'detalle', '312 372 3999', 'titular', 'Oscar''s Parrilla', 'activo', true, 'orden', 1),
      jsonb_build_object('method_id', 'transferencia', 'nombre', 'Transferencia bancaria', 'tipo', 'transferencia', 'detalle', 'Cuenta por configurar', 'titular', 'Oscar''s Parrilla', 'activo', true, 'orden', 2),
      jsonb_build_object('method_id', 'efectivo', 'nombre', 'Efectivo', 'tipo', 'efectivo', 'detalle', 'Solo para recoger', 'titular', '', 'activo', true, 'orden', 3)
    ),
    'deliveryZones', jsonb_build_array(
      jsonb_build_object('zone_id', 'parnaso', 'nombre', 'Parnaso', 'aliases', jsonb_build_array('barrio parnaso', 'parnaso'), 'precio', 0, 'activo', true, 'orden', 1)
    )
  )
)
on conflict (setting_key) do nothing;

with delivery_seed(sector, precio, barrios) as (
  values
    ('Sector 1', 5000, array['COLOMBIA - RECREO','ISCREDIAL - ISLA DEL ZAPATO','BUENOS AIRES - BUENOS AIRES II','TRES UNIDOS - VICTORIA','MARGARITAS - CALLEJON PERROS','PARNASO - VILLA OLIMPICA','PUEBLO NUEVO - URIBE URIBE','AGUAS CLARAS - MIRADORES CACIQUE','CIPRES DEL LAGO - GALAN','CIUDAD BOLIVAR - COLINAS','OLAYA HERRERA - TORCOROMA','PALMIRA']),
    ('Sector 2', 6000, array['PROGRESO - PROVIVIENDA','ARENAL - SAN FRANCISCO','CAMPANA - CARDALES','DORADO - PLAYAS','DAVID NUÑEZ - SAN LUIS','PRIMERO MAYO - SAN JUDAS','AMERICAS - SANTANA','CAMPO ALEGRE - METROPOLIS','INTERNACIONAL - MALVINAS','LA TORA - LA Y','FLORESTA - LIBERTAD','FLORESTA BAJA - VILLA LUZ','ALTO ANGELES - BARRIO INDEPENDENCIA','TRIUNFO - PORVENIR','COLINAS SEMINARIO - CHAPINERO','CANDELARIA - MIRAFLORES','SIMON BOLIVAR - EL UNO','ALTOS DEL ROSARIO']),
    ('Sector 3', 7000, array['GRANJAS - BENJAMIN HERRERA','VERSALLES - ALCAZAR','ESPERANZA - NUEVA ESPERANZA','BELEN - LOS FICUS','LUIS ELEAZAR - 20 ENERO','SANTA ISABEL - COVIVA','OBRAS PUBLICAS - CRISTO REY','CIUDADELA PIPATON - CORTIJILLO','MARSELLA - BRISAS DEL INTERCAMBIADOR','YARIMA - ANTONIA SANTOS','SANTA BARBARA - ALTOS CAÑAVERAL','BAMBU - LOS PINOS','CINCUENTENARIO - REFUGIO','CERRO - PLANA DEL CERRO','BELLAVISTA - LIMONAR','NARANJOS - MANDARINOS','MIRADORES LA CEIBA - AUTOCONSTRUCCION','PRADOS CINCUENTENARIO','CIUDADELA CINCUENTENARIO','EL NOGAL - PENINSULA','CASTILLO - ANTONIO GALAN','VILLA SANDRA - NUEVO MILENIO SUR','LA LIGA - VILLA DE LEYVA','PALMAR - TAMARINDOS','LA PAZ - NOVALITO','VILLANUEVA - ALGARROBOS']),
    ('Sector 4', 8000, array['ALPES - ALAMOS','20 AGOSTO - BOSTON','DANUBIO - NARIÑO','SAN MARTIN - PUMARROSOS','RANGEL - COMUNEROS','ROSARIO - 25 AGOSTO','YARIGUIES','JERUSALEN - COLINAS DEL NORTE','VIYARELIS - BUENA VISTA','POZO 7 - VILLA AURA','9 ABRIL - NUEVO HORIZONTE','PALOCA - PABLO ACUÑA','CAMPIN - MARIA EUGENIA','CAMPESTRE - PARAISO','MINAS PARAISO - VIVERO CLUB','RESERVA CARDALES - SIENA 37','RETEN - BONANZA','AGUAS BARRAN - SAN SILVESTRE']),
    ('Sector 5', 9000, array['ALTOS DE ISRAEL - VILLA LUISA','HOTEL MIRAMAR','CIUDAD DEL SOL - TERRAZAS','PRADOS ARGELIA - ALTOS ARGELIA','22 DE MARZO - VILLA MARI']),
    ('Sector 6', 15000, array['GLAMPING MANHATAN','OLGA LUCIA','VILLA LINDA']),
    ('Sector 7', 20000, array['PUENTE YONDO - PUERTA NORTE','PUERTA DEL 11 - LAURELES','GENEZARED - LA ELVIRA','CAFABA - AEROPUERTO','IMPALA']),
    ('Sector 8', 30000, array['CENTRO','LLANITO'])
),
expanded_delivery as (
  select sector, precio, barrio, row_number() over () as orden
  from delivery_seed, unnest(barrios) as barrio
),
delivery_zones as (
  select jsonb_agg(jsonb_build_object(
    'zone_id', lower(regexp_replace(sector || '-' || barrio, '[^a-zA-Z0-9]+', '-', 'g')),
    'nombre', barrio,
    'sector', sector,
    'aliases', jsonb_build_array('barrio ' || barrio, barrio),
    'precio', precio,
    'activo', true,
    'orden', orden
  )) as zones
  from expanded_delivery
)
update public.business_settings
set value = jsonb_set(value, '{deliveryZones}', (select zones from delivery_zones), true),
    updated_at = now()
where setting_key = 'operation_config';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "public upload product images" on storage.objects;
create policy "public upload product images" on storage.objects for insert with check (bucket_id = 'product-images');
drop policy if exists "public update product images" on storage.objects;
create policy "public update product images" on storage.objects for update using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
drop policy if exists "public delete product images" on storage.objects;
create policy "public delete product images" on storage.objects for delete using (bucket_id = 'product-images');

insert into public.cashiers (cashier_id, nombre, correo, clave, rol, activo)
values ('cash-jefe-principal', 'Jefe principal', 'admin@oscarsparrilla.co', '5678', 'jefe', true)
on conflict (correo) do nothing;

-- Seeds migrados desde productos.tsv y extras.tsv del AppScript original.
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-lim-soda', 'bebidas', 'Limonada en Soda', 12000, 'Subcategoría: Limonadas.', '', '[]'::jsonb, 1, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-lim-pepino', 'bebidas', 'Limonada de Pepino', 12000, 'Subcategoría: Limonadas.', '', '[]'::jsonb, 2, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-lim-hierbabuena', 'bebidas', 'Limonada de Hierbabuena', 12000, 'Subcategoría: Limonadas.', '', '[]'::jsonb, 3, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-lim-uva', 'bebidas', 'Limonada de Uva', 12000, 'Subcategoría: Limonadas.', '', '[]'::jsonb, 4, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-lim-mango', 'bebidas', 'Limonada de Mango', 12000, 'Subcategoría: Limonadas.', '', '[]'::jsonb, 5, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-lim-cereza', 'bebidas', 'Limonada de Cereza', 13000, 'Subcategoría: Limonadas.', '', '[]'::jsonb, 6, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-lim-coco', 'bebidas', 'Limonada de Coco', 13000, 'Subcategoría: Limonadas.', '', '[]'::jsonb, 7, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-cer-original', 'bebidas', 'Original', 5500, 'Subcategoría: Cervezas Nacionales.', '', '[]'::jsonb, 8, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-cer-light', 'bebidas', 'Light', 5500, 'Subcategoría: Cervezas Nacionales.', '', '[]'::jsonb, 9, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-cer-pilsen', 'bebidas', 'Pilsen', 5500, 'Subcategoría: Cervezas Nacionales.', '', '[]'::jsonb, 10, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-cer-poker', 'bebidas', 'Poker', 5500, 'Subcategoría: Cervezas Nacionales.', '', '[]'::jsonb, 11, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-cer-andina', 'bebidas', 'Andina', 5500, 'Subcategoría: Cervezas Nacionales.', '', '[]'::jsonb, 12, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-cer-club-colombia-dorada', 'bebidas', 'Club Colombia Dorada', 7000, 'Subcategoría: Cervezas Nacionales.', '', '[]'::jsonb, 13, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-cer-coronita', 'bebidas', 'Coronita', 8000, 'Subcategoría: Cervezas Importadas.', '', '[]'::jsonb, 14, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-granizado-agua', 'bebidas', 'Granizado en Agua', 9000, 'Subcategoría: Granizados. Sabores disponibles: Fresa, Limón, Mandarina, Naranja, Lulo, Maracuyá, Mango, Uva, Guanábana, Mora.', '', '[{"id":"opt-granizado-agua-fresa","label":"Fresa","price":9000},{"id":"opt-granizado-agua-limon","label":"Limón","price":9000},{"id":"opt-granizado-agua-mandarina","label":"Mandarina","price":9000},{"id":"opt-granizado-agua-naranja","label":"Naranja","price":9000},{"id":"opt-granizado-agua-lulo","label":"Lulo","price":9000},{"id":"opt-granizado-agua-maracuya","label":"Maracuyá","price":9000},{"id":"opt-granizado-agua-mango","label":"Mango","price":9000},{"id":"opt-granizado-agua-uva","label":"Uva","price":9000},{"id":"opt-granizado-agua-guanabana","label":"Guanábana","price":9000},{"id":"opt-granizado-agua-mora","label":"Mora","price":9000}]'::jsonb, 15, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-granizado-leche', 'bebidas', 'Granizado en Leche', 10000, 'Subcategoría: Granizados. Sabores disponibles: Fresa, Limón, Mandarina, Naranja, Lulo, Maracuyá, Mango, Uva, Guanábana, Mora.', '', '[{"id":"opt-granizado-leche-fresa","label":"Fresa","price":10000},{"id":"opt-granizado-leche-limon","label":"Limón","price":10000},{"id":"opt-granizado-leche-mandarina","label":"Mandarina","price":10000},{"id":"opt-granizado-leche-naranja","label":"Naranja","price":10000},{"id":"opt-granizado-leche-lulo","label":"Lulo","price":10000},{"id":"opt-granizado-leche-maracuya","label":"Maracuyá","price":10000},{"id":"opt-granizado-leche-mango","label":"Mango","price":10000},{"id":"opt-granizado-leche-uva","label":"Uva","price":10000},{"id":"opt-granizado-leche-guanabana","label":"Guanábana","price":10000},{"id":"opt-granizado-leche-mora","label":"Mora","price":10000}]'::jsonb, 16, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-granizado-frutos-amarillos', 'bebidas', 'Granizado Frutos Amarillos', 10500, 'Subcategoría: Granizados.', '', '[]'::jsonb, 17, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-granizado-frutos-rojos', 'bebidas', 'Granizado Frutos Rojos', 10500, 'Subcategoría: Granizados.', '', '[]'::jsonb, 18, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-gaseosa-350', 'bebidas', 'Gaseosa 350 ml', 5000, 'Subcategoría: Gaseosas.', '', '[]'::jsonb, 19, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-gaseosa-pet-400', 'bebidas', 'Gaseosa PET 400 ml', 6000, 'Subcategoría: Gaseosas.', '', '[]'::jsonb, 20, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-gaseosa-15l', 'bebidas', 'Gaseosa 1.5 L', 13000, 'Subcategoría: Gaseosas.', '', '[]'::jsonb, 21, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-agua', 'bebidas', 'Botella de Agua', 4000, 'Subcategoría: Otras Bebidas.', '', '[]'::jsonb, 22, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-soda-michelada', 'bebidas', 'Soda Michelada', 6000, 'Subcategoría: Otras Bebidas.', '', '[]'::jsonb, 23, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-beb-michelada-cereza', 'bebidas', 'Michelada de Cereza', 6000, 'Subcategoría: Otras Bebidas.', '', '[]'::jsonb, 24, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-oscars', 'burgers', 'Oscar''s', 50000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 25, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-hummer', 'burgers', 'Hummer', 45000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 26, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-toyota-ranchera', 'burgers', 'Toyota Ranchera', 29000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 27, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-ferrari', 'burgers', 'Ferrari', 29000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 28, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-grand-cherokee', 'burgers', 'Grand Cherokee', 29000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 29, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-mercedes-benz', 'burgers', 'Mercedes Benz', 27000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 30, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-morgan', 'burgers', 'Morgan', 26000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 31, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-chrysler', 'burgers', 'Chrysler', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 32, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-dodge', 'burgers', 'Dodge', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 33, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-ford', 'burgers', 'Ford', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 34, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-mazda', 'burgers', 'Mazda', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 35, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-burgers-renault-4', 'burgers', 'Renault 4', 19000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 36, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-perros-mclaren', 'perros', 'McLaren', 30000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 37, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-perros-peugeot', 'perros', 'Peugeot', 24000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 38, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-perros-honda', 'perros', 'Honda', 22000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 39, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-perros-maserati', 'perros', 'Maserati', 22000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 40, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-perros-hilux', 'perros', 'Hilux', 21000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 41, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-perros-chevrolet', 'perros', 'Chevrolet', 19000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 42, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-perros-spark', 'perros', 'Spark', 18000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 43, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-alitas-x6', 'alitas', 'Alitas x6', 30000, 'Opciones: Apanadas, Asadas al carbón. Salsas disponibles: BBQ, Miel Mostaza, Picante Búfalo.', '', '[{"id":"opt-alitas-x6-apanadas","label":"Apanadas","price":30000},{"id":"opt-alitas-x6-asadas-carbon","label":"Asadas al carbón","price":30000}]'::jsonb, 44, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-alitas-x12', 'alitas', 'Alitas x12', 60000, 'Opciones: Apanadas, Asadas al carbón. Salsas disponibles: BBQ, Miel Mostaza, Picante Búfalo.', '', '[{"id":"opt-alitas-x12-apanadas","label":"Apanadas","price":60000},{"id":"opt-alitas-x12-asadas-carbon","label":"Asadas al carbón","price":60000}]'::jsonb, 45, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-picadas-x2', 'picadas', 'Picada x2', 48000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 46, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-picadas-x3', 'picadas', 'Picada x3', 72000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 47, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-picadas-x4', 'picadas', 'Picada x4', 96000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 48, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-desgranados-oscars', 'desgranados', 'Oscars', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 49, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-desgranados-kia', 'desgranados', 'Kia', 15000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 50, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-sandwiches-oscars', 'sandwiches', 'Oscars', 32000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 51, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-sandwiches-jaguar', 'sandwiches', 'Jaguar', 30000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 52, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-oscars', 'papas-especiales', 'Oscar''s', 30000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 53, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-daewo', 'papas-especiales', 'Daewo', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 54, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-salchichoripollo', 'papas-especiales', 'Salchichoripollo', 24000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 55, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-mitsubishi', 'papas-especiales', 'Mitsubishi', 22000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 56, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-bmw', 'papas-especiales', 'BMW', 21000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 57, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-jeep', 'papas-especiales', 'Jeep', 20000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 58, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-tesla', 'papas-especiales', 'Tesla', 19000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 59, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-papas-nissan', 'papas-especiales', 'Nissan', 18000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 60, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-ensaladas-oscars', 'ensaladas', 'Oscar''s', 20000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 61, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-crepes-roll-royce', 'crepes', 'Roll Royce', 30000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 62, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-crepes-dacia', 'crepes', 'Dacia', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 63, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-crepes-oscars', 'crepes', 'Oscars', 22000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 64, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-patacones-oscars', 'patacones', 'Oscar''s', 28000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 65, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-patacones-skoda', 'patacones', 'Skoda', 25000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 66, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-patacones-bentley', 'patacones', 'Bentley', 24000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 67, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-cortes-churrasco-porsche', 'cortes', 'Churrasco Porsche', 50000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 68, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-cortes-punta-anca-lamborghini', 'cortes', 'Punta de Anca Lamborghini', 50000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 69, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-cortes-pechuga-land-rover', 'cortes', 'Pechuga Land Rover', 45000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 70, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-cortes-pechuga-california', 'cortes', 'Pechuga California', 50000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 71, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-cortes-costillas-aston-martin', 'cortes', 'Costillas Aston Martin', 40000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 72, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-pizzetas-oscars', 'pizzetas', 'Oscar''s', 30000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 73, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-pizzetas-chery', 'pizzetas', 'Chery', 30000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 74, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-pizzetas-lancia', 'pizzetas', 'Lancia', 30000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 75, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-pizzetas-tesla', 'pizzetas', 'Tesla', 27000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 76, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-pizzetas-genesis', 'pizzetas', 'Genesis', 27000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 77, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-pizzetas-apolo', 'pizzetas', 'Apolo', 27000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 78, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-pizzetas-rubicon', 'pizzetas', 'Rubicon', 27000, 'Descripción completa no suministrada en el menú fuente.', '', '[]'::jsonb, 79, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-menu-infantil-hamburguesa-mate', 'menu-infantil', 'Hamburguesa Mate', 19000, 'Descripción completa y opciones no suministradas en el menú fuente.', '', '[]'::jsonb, 80, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-menu-infantil-perro-guido', 'menu-infantil', 'Perro Guido', 19000, 'Descripción completa y opciones no suministradas en el menú fuente.', '', '[]'::jsonb, 81, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-menu-infantil-deditos-pollo-mc', 'menu-infantil', 'Deditos de Pollo MC', 22000, 'Descripción completa y opciones no suministradas en el menú fuente.', '', '[]'::jsonb, 82, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.products (producto_id, categoria_id, nombre, precio, descripcion, imagen, opciones, orden, activo) values ('prod-menu-infantil-pizzeta-sally', 'menu-infantil', 'Pizzeta Sally', 22000, 'Descripción completa y opciones no suministradas en el menú fuente.', '', '[]'::jsonb, 83, true) on conflict (producto_id) do update set categoria_id = excluded.categoria_id, nombre = excluded.nombre, precio = excluded.precio, descripcion = excluded.descripcion, imagen = excluded.imagen, opciones = excluded.opciones, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-queso', 'Queso extra', 5000, 1, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-borde-queso', 'Borde de queso', 7000, 2, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-pepperoni', 'Pepperoni extra', 6000, 3, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-tocineta', 'Tocineta extra', 6500, 4, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-champinon', 'Champiñones extra', 4500, 5, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-jalapeno', 'Jalapeños', 3500, 6, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-salsa-ajo', 'Salsa de ajo', 2500, 7, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;
insert into public.extras (extra_id, nombre, precio, orden, activo) values ('extra-salsa-picante', 'Salsa picante', 2500, 8, true) on conflict (extra_id) do update set nombre = excluded.nombre, precio = excluded.precio, orden = excluded.orden, activo = excluded.activo;

-- Reparacion de textos importados con mojibake desde la fuente anterior.
create or replace function public.fix_mojibake_text(input text)
returns text
language plpgsql
immutable
as $$
declare
  output text := coalesce(input, '');
begin
  output := replace(output, 'Descripci�n', 'Descripción');
  output := replace(output, 'Subcategor�a', 'Subcategoría');
  output := replace(output, 'men�', 'menú');
  output := replace(output, 'Lim�n', 'Limón');
  output := replace(output, 'Maracuy�', 'Maracuyá');
  output := replace(output, 'Guan�bana', 'Guanábana');
  output := replace(output, 'carb�n', 'carbón');
  output := replace(output, 'B�falo', 'Búfalo');
  output := replace(output, 'Champi�ones', 'Champiñones');
  output := replace(output, 'Jalape�os', 'Jalapeños');
  return output;
end $$;

update public.products
set
  nombre = public.fix_mojibake_text(nombre),
  descripcion = public.fix_mojibake_text(descripcion),
  opciones = public.fix_mojibake_text(opciones::text)::jsonb;

update public.extras
set nombre = public.fix_mojibake_text(nombre);

notify pgrst, 'reload schema';
