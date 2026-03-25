# Logistik

Plataforma logistica tipo ticketera para gestionar solicitudes de retiro y entrega entre empresas, transportistas y conductores, construida con Next.js 14, TypeScript y Supabase.

## Vision general

Logistik centraliza el ciclo de vida de tickets de transporte de carga. Cada actor opera con permisos acotados:

- `cliente`: crea tickets y consulta los de su empresa
- `transportista`: gestiona tickets asignados a su organizacion
- `conductor`: visualiza sus viajes y avanza estados
- `operador` y `admin`: supervisan toda la operacion, asignan recursos y gestionan usuarios

## Stack tecnologico

- Frontend y framework: Next.js 14 con App Router
- Lenguaje: TypeScript
- Backend, autenticacion y base de datos: Supabase + PostgreSQL
- Sesion SSR: `@supabase/ssr`
- Estilos: CSS global modular propio en [app/globals.css](C:\Users\eigua\OneDrive\Documentos\New project\app\globals.css)
- Deploy: Vercel

## Estructura

```bash
.
├── app
│   ├── auth/callback/route.ts
│   ├── auth/set-password/page.tsx
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── tickets/new/page.tsx
│   └── tickets/[id]/page.tsx
├── components
│   ├── layout
│   └── tickets
├── lib
│   ├── auth
│   ├── data
│   └── supabase
├── sql/schema.sql
├── supabase/config.toml
└── types/index.ts
```

## Arquitectura y seguridad

- El modelo de roles vive en el enum `app_role` dentro de [sql/schema.sql](C:\Users\eigua\OneDrive\Documentos\New project\sql\schema.sql).
- La tabla [sql/schema.sql](C:\Users\eigua\OneDrive\Documentos\New project\sql\schema.sql) define `empresas`, `transportistas`, `conductores`, `usuarios`, `tickets` e `historial_estados`.
- `usuarios` extiende `auth.users` con un trigger `bootstrap_user()` para crear el perfil operativo automaticamente.
- La seguridad se delega a RLS con funciones como `current_role()`, `is_admin_or_operador()` y `can_access_ticket()`.
- Las operaciones sensibles se encapsulan en funciones RPC:
  - `set_ticket_status()`
  - `assign_ticket()`
- La trazabilidad del ticket se garantiza con `historial_estados` y el trigger `trg_initial_ticket_history`.

## Flujo visual por rol

| Rol | Pantallas | Componentes | Permisos clave |
| --- | --- | --- | --- |
| Cliente | `Login`, `DashboardCliente`, `CrearTicket`, `DetalleTicketCliente` | `TicketForm`, `TicketCard`, `HistorialEstados`, `FiltroTickets` | Crea tickets y ve solo los de su empresa |
| Transportista | `DashboardTransportista`, `DetalleTicketTransportista` | `TicketCard`, `ModalAsignarConductor`, `StatusActions`, `HistorialEstados` | Ve tickets asignados y asigna conductores |
| Conductor | `DashboardConductor`, `DetalleTicketConductor` | `TicketCard`, `StatusActions`, `HistorialEstados` | Ve sus tickets y avanza estados |
| Operador/Admin | `DashboardOperador`, `DetalleTicketOperador`, `GestionUsuarios` | `TicketCard`, `FiltroTickets`, `ModalAsignarConductor`, `StatusActions`, `UserManagement` | Ve todo, asigna y administra |

## Estados

`pendiente -> asignado -> en_retiro -> en_transito -> entregado`

## Levantar el proyecto

1. Instala dependencias con `npm install`.
2. Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

3. En Supabase:
   - Ejecuta [sql/schema.sql](C:\Users\eigua\OneDrive\Documentos\New project\sql\schema.sql)
   - Configura Auth con tu `Site URL` y `Redirect URLs`
4. Ejecuta `npm run dev`.
5. En Vercel, importa el repo y define las variables publicas de Supabase.

## Buenas practicas aplicadas

- SSR y middleware para manejo de sesion y proteccion de rutas
- Row Level Security como capa principal de autorizacion
- Triggers de base de datos para perfiles y trazabilidad
- Componentes reutilizables y logica separada en `lib/`
- Base preparada para escalar a tracking, GPS y automatizacion

## Documento extendido

La descripcion funcional y tecnica ampliada vive en [docs/ARCHITECTURE.md](C:\Users\eigua\OneDrive\Documentos\New project\docs\ARCHITECTURE.md).
