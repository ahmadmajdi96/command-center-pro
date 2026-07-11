
-- ============ ROLES ============
create type public.app_role as enum ('admin','manager','supervisor','operator','quality','maintenance');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  warehouse_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  warehouse_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = 'admin');
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- signup trigger: create profile + default operator role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'operator')
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- generic updated_at
create or replace function public.tg_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============ WAREHOUSES / LAYOUT ============
create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  city text,
  country text default 'SA',
  timezone text default 'Asia/Riyadh',
  width_m numeric not null default 100,
  length_m numeric not null default 60,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.warehouses to authenticated;
grant all on public.warehouses to service_role;
alter table public.warehouses enable row level security;
create policy "wh read" on public.warehouses for select to authenticated using (true);
create policy "wh write mgr" on public.warehouses for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager'));
create trigger tg_warehouses_updated before update on public.warehouses for each row execute function public.tg_updated_at();

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  code text not null,
  name text not null,
  kind text not null default 'storage', -- storage, receiving, shipping, quality, staging
  color text default '#22d3ee',
  x numeric not null default 0, y numeric not null default 0,
  w numeric not null default 20, h numeric not null default 15,
  unique (warehouse_id, code)
);
grant select, insert, update, delete on public.zones to authenticated;
grant all on public.zones to service_role;
alter table public.zones enable row level security;
create policy "zones read" on public.zones for select to authenticated using (true);
create policy "zones write mgr" on public.zones for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));

create table public.aisles (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones(id) on delete cascade,
  code text not null,
  x numeric not null default 0, y numeric not null default 0,
  length_m numeric not null default 10,
  orientation text not null default 'x', -- 'x' or 'y'
  unique (zone_id, code)
);
grant select, insert, update, delete on public.aisles to authenticated;
grant all on public.aisles to service_role;
alter table public.aisles enable row level security;
create policy "aisles read" on public.aisles for select to authenticated using (true);
create policy "aisles write mgr" on public.aisles for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));

create table public.racks (
  id uuid primary key default gen_random_uuid(),
  aisle_id uuid not null references public.aisles(id) on delete cascade,
  code text not null,
  x numeric not null default 0, y numeric not null default 0,
  w numeric not null default 2.5,
  d numeric not null default 1.2,
  levels int not null default 4,
  unique (aisle_id, code)
);
grant select, insert, update, delete on public.racks to authenticated;
grant all on public.racks to service_role;
alter table public.racks enable row level security;
create policy "racks read" on public.racks for select to authenticated using (true);
create policy "racks write mgr" on public.racks for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));

create table public.bins (
  id uuid primary key default gen_random_uuid(),
  rack_id uuid not null references public.racks(id) on delete cascade,
  code text not null,
  level int not null default 1,
  position int not null default 1,
  status text not null default 'empty', -- empty | occupied | blocked | quality_hold
  unique (rack_id, code)
);
grant select, insert, update, delete on public.bins to authenticated;
grant all on public.bins to service_role;
alter table public.bins enable row level security;
create policy "bins read" on public.bins for select to authenticated using (true);
create policy "bins write" on public.bins for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor') or public.has_role(auth.uid(),'operator'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor') or public.has_role(auth.uid(),'operator'));

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text,
  uom text not null default 'EA',
  abc_class text default 'B',
  hazmat boolean not null default false,
  min_stock numeric default 0,
  max_stock numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products read" on public.products for select to authenticated using (true);
create policy "products write" on public.products for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));
create trigger tg_products_updated before update on public.products for each row execute function public.tg_updated_at();

-- ============ INVENTORY ============
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  bin_id uuid references public.bins(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  lot text,
  expiry date,
  qty numeric not null default 0,
  status text not null default 'available', -- available | quality_hold | reserved | damaged
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.inventory to authenticated;
grant all on public.inventory to service_role;
alter table public.inventory enable row level security;
create policy "inv read" on public.inventory for select to authenticated using (true);
create policy "inv write" on public.inventory for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor') or public.has_role(auth.uid(),'operator'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor') or public.has_role(auth.uid(),'operator'));
create trigger tg_inventory_updated before update on public.inventory for each row execute function public.tg_updated_at();

-- ============ SUPPLIERS / CUSTOMERS ============
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  contact_email text, country text default 'SA',
  status text default 'active',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.suppliers to authenticated;
grant all on public.suppliers to service_role;
alter table public.suppliers enable row level security;
create policy "suppliers read" on public.suppliers for select to authenticated using (true);
create policy "suppliers write" on public.suppliers for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  contact_email text, country text default 'SA',
  status text default 'active',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "customers read" on public.customers for select to authenticated using (true);
create policy "customers write" on public.customers for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));

-- ============ PURCHASE ORDERS ============
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid references public.suppliers(id) on delete set null,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  status text not null default 'draft', -- draft|open|receiving|closed|cancelled
  expected_at date,
  total_value numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.purchase_orders to authenticated;
grant all on public.purchase_orders to service_role;
alter table public.purchase_orders enable row level security;
create policy "po read" on public.purchase_orders for select to authenticated using (true);
create policy "po write" on public.purchase_orders for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));
create trigger tg_po_updated before update on public.purchase_orders for each row execute function public.tg_updated_at();

create table public.purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  po_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty_ordered numeric not null default 0,
  qty_received numeric not null default 0,
  unit_price numeric default 0
);
grant select, insert, update, delete on public.purchase_order_lines to authenticated;
grant all on public.purchase_order_lines to service_role;
alter table public.purchase_order_lines enable row level security;
create policy "pol read" on public.purchase_order_lines for select to authenticated using (true);
create policy "pol write" on public.purchase_order_lines for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));

-- ============ SALES ORDERS ============
create table public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  so_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  status text not null default 'new', -- new|allocated|picking|packing|shipped|cancelled
  requested_at date,
  total_value numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.sales_orders to authenticated;
grant all on public.sales_orders to service_role;
alter table public.sales_orders enable row level security;
create policy "so read" on public.sales_orders for select to authenticated using (true);
create policy "so write" on public.sales_orders for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));
create trigger tg_so_updated before update on public.sales_orders for each row execute function public.tg_updated_at();

create table public.sales_order_lines (
  id uuid primary key default gen_random_uuid(),
  so_id uuid not null references public.sales_orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty_ordered numeric not null default 0,
  qty_shipped numeric not null default 0,
  unit_price numeric default 0
);
grant select, insert, update, delete on public.sales_order_lines to authenticated;
grant all on public.sales_order_lines to service_role;
alter table public.sales_order_lines enable row level security;
create policy "sol read" on public.sales_order_lines for select to authenticated using (true);
create policy "sol write" on public.sales_order_lines for all to authenticated
  using (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'))
  with check (public.is_admin(auth.uid()) or public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'supervisor'));
