# LogiFlow

Plataforma logística tipo ticketera construida con Next.js 14 App Router y Supabase, lista para desplegar en Vercel.

## Estructura

```bash
.
├── app
│   ├── auth/callback/route.ts
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
└── types/index.ts
```

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

1. Instala dependencias:

```bash
npm install
```

2. Crea el archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

3. En Supabase:
   - Activa Email OTP / Magic Link.
   - Configura `Site URL` y `Redirect URLs` con `http://localhost:3000/auth/callback` y tu dominio de Vercel.
   - Ejecuta `sql/schema.sql`.

4. Corre el entorno local:

```bash
npm run dev
```

5. Despliega en Vercel:
   - Importa el repo.
   - Define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Publica.

## Buenas prácticas incluidas

- App Router con sesiones SSR y middleware.
- RLS por empresa, transportista y conductor.
- RPCs para asignación y cambios de estado con auditoría.
- Componentes modulares y reutilizables.
- Base lista para escalar a tracking, GPS y automatizaciones.
