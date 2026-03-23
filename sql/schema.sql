create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'cliente', 'operador', 'conductor', 'transportista');
  end if;

  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type public.ticket_status as enum (
      'pendiente',
      'asignado',
      'en_retiro',
      'en_transito',
      'entregado',
      'cancelado'
    );
  end if;
end$$;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transportistas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conductores (
  id uuid primary key default gen_random_uuid(),
  transportista_id uuid not null references public.transportistas(id) on delete cascade,
  nombre text not null,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text not null,
  rol public.app_role not null default 'cliente',
  empresa_id uuid references public.empresas(id) on delete set null,
  transportista_id uuid references public.transportistas(id) on delete set null,
  conductor_id uuid references public.conductores(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint conductor_role_requires_conductor check (
    (rol <> 'conductor') or (conductor_id is not null and transportista_id is not null)
  )
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  transportista_id uuid references public.transportistas(id) on delete set null,
  conductor_id uuid references public.conductores(id) on delete set null,
  creado_por uuid not null references public.usuarios(id) on delete restrict,
  origen_direccion text not null,
  destino_direccion text not null,
  descripcion text not null,
  tipo_carga text not null,
  estado public.ticket_status not null default 'pendiente',
  fecha_retiro timestamptz,
  fecha_entrega timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.historial_estados (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  estado public.ticket_status not null,
  comentario text,
  cambiado_por uuid references public.usuarios(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_usuarios_empresa on public.usuarios(empresa_id);
create index if not exists idx_usuarios_transportista on public.usuarios(transportista_id);
create index if not exists idx_conductores_transportista on public.conductores(transportista_id);
create index if not exists idx_tickets_empresa on public.tickets(empresa_id);
create index if not exists idx_tickets_transportista on public.tickets(transportista_id);
create index if not exists idx_tickets_conductor on public.tickets(conductor_id);
create index if not exists idx_tickets_estado on public.tickets(estado);
create index if not exists idx_tickets_created_at on public.tickets(created_at desc);
create index if not exists idx_historial_ticket on public.historial_estados(ticket_id, created_at desc);

create or replace function public.current_role()
returns public.app_role
language sql
stable
as $$
  select rol from public.usuarios where id = auth.uid()
$$;

create or replace function public.is_admin_or_operador()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.usuarios
    where id = auth.uid()
      and rol in ('admin', 'operador')
  )
$$;

create or replace function public.can_access_ticket(target public.tickets)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.id = auth.uid()
      and (
        u.rol in ('admin', 'operador')
        or (u.rol = 'cliente' and u.empresa_id = target.empresa_id)
        or (u.rol = 'transportista' and u.transportista_id = target.transportista_id)
        or (u.rol = 'conductor' and u.conductor_id = target.conductor_id)
      )
  )
$$;

create or replace function public.bootstrap_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, nombre, rol)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'rol')::public.app_role, 'cliente')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.bootstrap_user();

create or replace function public.create_initial_ticket_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.historial_estados (ticket_id, estado, comentario, cambiado_por)
  values (new.id, new.estado, 'Ticket creado', new.creado_por);

  return new;
end;
$$;

drop trigger if exists trg_initial_ticket_history on public.tickets;
create trigger trg_initial_ticket_history
  after insert on public.tickets
  for each row execute procedure public.create_initial_ticket_history();

create or replace function public.set_ticket_status(
  p_ticket_id uuid,
  p_new_status public.ticket_status,
  p_comment text default null
)
returns public.tickets
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_ticket public.tickets;
  v_role public.app_role;
begin
  select * into v_ticket from public.tickets where id = p_ticket_id;
  if not found then
    raise exception 'Ticket no encontrado';
  end if;

  if not public.can_access_ticket(v_ticket) then
    raise exception 'Sin permisos para actualizar este ticket';
  end if;

  select rol into v_role from public.usuarios where id = auth.uid();
  if v_role = 'cliente' then
    raise exception 'El cliente no puede cambiar estados';
  end if;

  update public.tickets
  set estado = p_new_status
  where id = p_ticket_id
  returning * into v_ticket;

  insert into public.historial_estados (ticket_id, estado, comentario, cambiado_por)
  values (v_ticket.id, p_new_status, p_comment, auth.uid());

  return v_ticket;
end;
$$;

create or replace function public.assign_ticket(
  p_ticket_id uuid,
  p_transportista_id uuid default null,
  p_conductor_id uuid default null,
  p_comment text default null
)
returns public.tickets
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_ticket public.tickets;
  v_user public.usuarios;
begin
  select * into v_ticket from public.tickets where id = p_ticket_id;
  if not found then
    raise exception 'Ticket no encontrado';
  end if;

  select * into v_user from public.usuarios where id = auth.uid();
  if v_user.rol not in ('admin', 'operador', 'transportista') then
    raise exception 'Sin permisos para asignar ticket';
  end if;

  if v_user.rol = 'transportista' and v_user.transportista_id is distinct from p_transportista_id then
    raise exception 'El transportista solo puede asignar dentro de su organización';
  end if;

  update public.tickets
  set
    transportista_id = coalesce(p_transportista_id, transportista_id),
    conductor_id = p_conductor_id,
    estado = case when estado = 'pendiente' then 'asignado' else estado end
  where id = p_ticket_id
  returning * into v_ticket;

  insert into public.historial_estados (ticket_id, estado, comentario, cambiado_por)
  values (
    v_ticket.id,
    v_ticket.estado,
    coalesce(p_comment, 'Asignación manual de transportista/conductor'),
    auth.uid()
  );

  return v_ticket;
end;
$$;

alter table public.empresas enable row level security;
alter table public.transportistas enable row level security;
alter table public.conductores enable row level security;
alter table public.usuarios enable row level security;
alter table public.tickets enable row level security;
alter table public.historial_estados enable row level security;

drop policy if exists empresas_select_policy on public.empresas;
create policy empresas_select_policy
on public.empresas
for select
using (
  public.is_admin_or_operador()
  or id = (select empresa_id from public.usuarios where id = auth.uid())
);

drop policy if exists transportistas_select_policy on public.transportistas;
create policy transportistas_select_policy
on public.transportistas
for select
using (
  public.is_admin_or_operador()
  or id = (select transportista_id from public.usuarios where id = auth.uid())
);

drop policy if exists conductores_select_policy on public.conductores;
create policy conductores_select_policy
on public.conductores
for select
using (
  public.is_admin_or_operador()
  or transportista_id = (select transportista_id from public.usuarios where id = auth.uid())
  or id = (select conductor_id from public.usuarios where id = auth.uid())
);

drop policy if exists usuarios_select_policy on public.usuarios;
create policy usuarios_select_policy
on public.usuarios
for select
using (
  auth.uid() = id
  or public.is_admin_or_operador()
);

drop policy if exists usuarios_update_policy on public.usuarios;
create policy usuarios_update_policy
on public.usuarios
for update
using (public.is_admin_or_operador())
with check (public.is_admin_or_operador());

drop policy if exists tickets_select_policy on public.tickets;
create policy tickets_select_policy
on public.tickets
for select
using (public.can_access_ticket(tickets));

drop policy if exists tickets_insert_policy on public.tickets;
create policy tickets_insert_policy
on public.tickets
for insert
with check (
  (
    public.current_role() in ('admin', 'operador')
  )
  or (
    public.current_role() = 'cliente'
    and empresa_id = (select empresa_id from public.usuarios where id = auth.uid())
    and creado_por = auth.uid()
    and transportista_id is null
    and conductor_id is null
    and estado = 'pendiente'
  )
);

drop policy if exists tickets_update_policy on public.tickets;
create policy tickets_update_policy
on public.tickets
for update
using (public.can_access_ticket(tickets))
with check (
  public.is_admin_or_operador()
  or (
    public.current_role() = 'transportista'
    and transportista_id = (select transportista_id from public.usuarios where id = auth.uid())
  )
  or (
    public.current_role() = 'conductor'
    and conductor_id = (select conductor_id from public.usuarios where id = auth.uid())
  )
);

drop policy if exists historial_select_policy on public.historial_estados;
create policy historial_select_policy
on public.historial_estados
for select
using (
  exists (
    select 1
    from public.tickets t
    where t.id = historial_estados.ticket_id
      and public.can_access_ticket(t)
  )
);

drop policy if exists historial_insert_policy on public.historial_estados;
create policy historial_insert_policy
on public.historial_estados
for insert
with check (
  exists (
    select 1
    from public.tickets t
    where t.id = historial_estados.ticket_id
      and public.can_access_ticket(t)
  )
);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on public.empresas to authenticated, service_role;
grant select, insert, update on public.transportistas to authenticated, service_role;
grant select, insert, update on public.conductores to authenticated, service_role;
grant select, insert, update on public.usuarios to authenticated, service_role;
grant select, insert, update on public.tickets to authenticated, service_role;
grant select, insert on public.historial_estados to authenticated, service_role;
grant execute on function public.set_ticket_status(uuid, public.ticket_status, text) to authenticated, service_role;
grant execute on function public.assign_ticket(uuid, uuid, uuid, text) to authenticated, service_role;
