-- =====================================================================
--  Trivela Group — inicijalna šema (Postgres / Supabase)
--  Prekopiraj ceo fajl u Supabase → SQL Editor → Run.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type order_status as enum
    ('pending','paid','processing','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

-- ---------- Katalog ----------
create table if not exists collections (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  collection_id uuid not null references collections(id) on delete restrict,
  price         numeric(10,2) not null check (price > 0),
  description   text,
  badge         text,                       -- zastava/monogram (fallback dok nema slike)
  color         text,                       -- akcenat maske
  image_url     text,                       -- glavna slika (Supabase Storage)
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  model      text not null,                 -- npr. "iPhone 17 Pro Max"
  stock      int  not null default 0 check (stock >= 0),
  unique (product_id, model)
);

-- ---------- Admin ----------
create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ---------- Porudžbine ----------
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null
                     default ('TG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  status           order_status not null default 'pending',
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  shipping_address text,
  shipping_city    text,
  shipping_country text,
  subtotal         numeric(10,2) not null check (subtotal >= 0),
  shipping         numeric(10,2) not null default 0,
  total            numeric(10,2) not null check (total >= 0),
  created_at       timestamptz not null default now()
);

create table if not exists order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  product_id      uuid references products(id) on delete set null,
  product_name    text not null,            -- snapshot u trenutku kupovine
  collection_name text,                     -- snapshot
  model           text not null,
  unit_price      numeric(10,2) not null check (unit_price > 0),  -- snapshot cene
  quantity        int  not null check (quantity > 0),
  line_total      numeric(10,2) not null check (line_total >= 0)
);

-- ---------- Indeksi ----------
create index if not exists idx_products_collection on products (collection_id);
create index if not exists idx_variants_product    on product_variants (product_id);
create index if not exists idx_items_order         on order_items (order_id);

-- ---------- updated_at trigger ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_products_updated on products;
create trigger trg_products_updated
  before update on products
  for each row execute function set_updated_at();

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table collections      enable row level security;
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table admins           enable row level security;

-- Katalog: javno čitljiv (aktivni proizvodi), izmene samo admin
create policy "read collections"  on collections      for select using (true);
create policy "admin collections" on collections      for all using (is_admin()) with check (is_admin());

create policy "read products"     on products         for select using (active or is_admin());
create policy "admin products"    on products         for all using (is_admin()) with check (is_admin());

create policy "read variants"     on product_variants for select using (true);
create policy "admin variants"    on product_variants for all using (is_admin()) with check (is_admin());

-- Porudžbine: čita/menja samo admin iz browsera.
-- Kreiranje porudžbine ide preko servera (service_role zaobilazi RLS) da se cena ne bi falsifikovala.
create policy "admin read orders"    on orders      for select using (is_admin());
create policy "admin manage orders"  on orders      for all using (is_admin()) with check (is_admin());
create policy "admin read items"     on order_items for select using (is_admin());
create policy "admin manage items"   on order_items for all using (is_admin()) with check (is_admin());

create policy "admin read admins"    on admins       for select using (is_admin());

-- =====================================================================
--  Seed — naše maske (iz data/cases.ts)
-- =====================================================================
insert into collections (slug, name) values
  ('world-cup','World Cup'),
  ('euroleague','Euroleague')
on conflict (slug) do nothing;

insert into products (slug, name, collection_id, price, badge, color)
select v.slug, v.name, c.id, v.price, v.badge, v.color
from (values
  ('wc-ar','Argentina',  'world-cup', 24.90, '🇦🇷', '#75aadb'),
  ('wc-br','Brazil',     'world-cup', 24.90, '🇧🇷', '#f7d117'),
  ('wc-rs','Serbia',     'world-cup', 22.90, '🇷🇸', '#c1121f'),
  ('wc-fr','France',     'world-cup', 26.90, '🇫🇷', '#3b5bdb'),
  ('wc-pt','Portugal',   'world-cup', 24.90, '🇵🇹', '#2a9d8f'),
  ('wc-es','Spain',      'world-cup', 25.90, '🇪🇸', '#e63946'),
  ('wc-en','England',    'world-cup', 23.90, '🏴', '#457b9d'),
  ('wc-de','Germany',    'world-cup', 26.90, '🇩🇪', '#ffb703'),
  ('wc-nl','Netherlands','world-cup', 22.90, '🇳🇱', '#fb8500'),
  ('wc-hr','Croatia',    'world-cup', 24.90, '🇭🇷', '#7209b7'),
  ('el-rm','Real Madrid','euroleague',27.90, 'RM',  '#d4af37'),
  ('el-fcb','Barcelona', 'euroleague',27.90, 'FCB', '#a50044'),
  ('el-bay','Bayern',    'euroleague',26.90, 'FCB', '#dc052d'),
  ('el-mci','Man City',  'euroleague',28.90, 'MC',  '#6cabdd'),
  ('el-liv','Liverpool', 'euroleague',27.90, 'LFC', '#c8102e'),
  ('el-psg','PSG',       'euroleague',28.90, 'PSG', '#1a557f'),
  ('el-juv','Juventus',  'euroleague',26.90, 'JUV', '#9aa0a6'),
  ('el-mil','AC Milan',  'euroleague',25.90, 'ACM', '#fb090b')
) as v(slug,name,coll,price,badge,color)
join collections c on c.slug = v.coll
on conflict (slug) do nothing;

-- Varijante: svaki model za svaki proizvod (početna zaliha 25)
insert into product_variants (product_id, model, stock)
select p.id, m.model, 25
from products p
cross join (values
  ('iPhone 17 Pro Max'),('iPhone 17 Pro'),('iPhone 17'),
  ('iPhone 16 Pro Max'),('iPhone 16 Pro'),('iPhone 16'),
  ('iPhone 15 Pro Max'),('iPhone 15 Pro'),('iPhone 15'),
  ('Samsung S24 Ultra'),('Samsung S24')
) as m(model)
on conflict (product_id, model) do nothing;

-- =====================================================================
--  Kako sebe postaviti kao admina (posle registracije naloga):
--    insert into admins (user_id) values ('<tvoj-auth-user-id>');
--  (user_id nađeš u Supabase → Authentication → Users)
-- =====================================================================

-- =====================================================================
--  Storage — slike maskica (za /admin upload)
-- =====================================================================
-- Bucket je javno CITLJIV (slike se prikazuju bez logina), a pise samo admin.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin insert product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());

create policy "admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and is_admin());

create policy "admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());

-- =====================================================================
--  Custom case zahtevi (Trivela Drop -> "Create your custom case")
-- =====================================================================
create table if not exists custom_requests (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text not null,
  phone        text,
  phone_model  text not null,
  quantity     int  not null default 1 check (quantity > 0),
  address      text,
  city         text,
  postal_code  text,
  country      text,
  notes        text,
  image_url    text,                       -- kupceva slika (Storage)
  status       text not null default 'new',
  created_at   timestamptz not null default now()
);

alter table custom_requests enable row level security;

-- Svako sme da posalje zahtev; cita/menja samo admin.
create policy "public submit custom" on custom_requests for insert with check (true);
create policy "admin read custom"    on custom_requests for select using (is_admin());
create policy "admin manage custom"  on custom_requests for update using (is_admin()) with check (is_admin());

-- Bucket za slike koje kupci otpremaju uz zahtev.
insert into storage.buckets (id, name, public)
values ('custom-uploads', 'custom-uploads', true)
on conflict (id) do nothing;

create policy "public upload custom images"
  on storage.objects for insert
  with check (bucket_id = 'custom-uploads');

create policy "public read custom images"
  on storage.objects for select
  using (bucket_id = 'custom-uploads');

create policy "admin delete custom images"
  on storage.objects for delete
  using (bucket_id = 'custom-uploads' and is_admin());
