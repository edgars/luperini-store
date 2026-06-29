-- Run after drizzle-kit push / migrate
-- Enables RLS and baseline policies for the e-commerce schema

alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.coupons enable row level security;
alter table public.audit_log enable row level security;

-- Public catalog (read-only for active products)
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (status = 'active');

create policy "product_variants_public_read"
  on public.product_variants for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active'
    )
  );

create policy "product_images_public_read"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active'
    )
  );

-- Customer profile
create policy "users_select_own"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users_update_own"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Customer addresses
create policy "addresses_select_own"
  on public.addresses for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "addresses_insert_own"
  on public.addresses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "addresses_update_own"
  on public.addresses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "addresses_delete_own"
  on public.addresses for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Customer orders
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "order_items_select_own"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );

-- Customer tickets
create policy "tickets_select_own"
  on public.tickets for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "tickets_insert_own"
  on public.tickets for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "ticket_messages_select_own"
  on public.ticket_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id and t.user_id = (select auth.uid())
    )
  );

create policy "ticket_messages_insert_own"
  on public.ticket_messages for insert
  to authenticated
  with check (
    sender_type = 'customer'
    and (select auth.uid()) = sender_id
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id and t.user_id = (select auth.uid())
    )
  );

-- Admin role via app_metadata (set with service role, never user_metadata)
-- Example: update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb where email = 'admin@example.com';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Admin full access (service role bypasses RLS for server-side operations)
create policy "admin_all_users" on public.users for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_addresses" on public.addresses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_variants" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_order_items" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_payments" on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_shipments" on public.shipments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_tickets" on public.tickets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_ticket_messages" on public.ticket_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_coupons" on public.coupons for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_audit_log" on public.audit_log for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Sync auth.users → public.users on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
