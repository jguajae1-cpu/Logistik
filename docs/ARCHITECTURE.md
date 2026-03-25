# Arquitectura de Logistik

## 1. Vision general

Logistik es una plataforma de logistica tipo ticketera disenada para gestionar el ciclo de vida de tickets de transporte de carga. La aplicacion permite a clientes, transportistas, conductores y operadores o administradores interactuar con los tickets de forma jerarquica y segura.

## 2. Stack tecnologico

- Frontend / framework: Next.js 14 con App Router
- Lenguaje: TypeScript
- Backend / base de datos / autenticacion: Supabase sobre PostgreSQL
- Sesiones SSR: `@supabase/ssr`
- Estilos: CSS global propio en [app/globals.css](C:\Users\eigua\OneDrive\Documentos\New project\app\globals.css)
- Despliegue: Vercel

## 3. Arquitectura del proyecto

El proyecto sigue una estructura modular basada en App Router:

- `app/dashboard`
  - panel principal por rol
- `app/tickets`
  - alta y detalle de tickets
- `app/login`
  - acceso principal por email y contrasena
- `app/auth/callback`
  - intercambio de codigo de Supabase al volver desde links de auth
- `app/auth/set-password`
  - definicion o cambio de contrasena tras flujo de recuperacion
- `components`
  - interfaz reutilizable agrupada por dominio
- `lib`
  - clientes de Supabase, auth, utilidades y consultas
- `sql`
  - esquema y seguridad de base de datos
- `types`
  - tipos compartidos de dominio

## 4. Modelo de datos y seguridad

### Roles y actores

El sistema define el enum `app_role` con cinco roles:

- `admin`
- `cliente`
- `operador`
- `conductor`
- `transportista`

### Tablas principales

- `empresas`
  - agrupa clientes empresariales
- `transportistas`
  - agrupa operadores logisiticos externos
- `conductores`
  - personal operativo asociado a un transportista
- `usuarios`
  - extiende `auth.users` con rol y pertenencia operativa
- `tickets`
  - nucleo del sistema de solicitudes logisticas
- `historial_estados`
  - bitacora completa de cambios y comentarios

### Triggers y automatizacion de consistencia

- `bootstrap_user()`
  - crea automaticamente el perfil en `public.usuarios` cuando nace un usuario en `auth.users`
- `trg_initial_ticket_history`
  - registra la creacion inicial del ticket en `historial_estados`

### Row Level Security

Las politicas RLS se apoyan en funciones SQL para expresar permisos por rol:

- `current_role()`
- `is_admin_or_operador()`
- `can_access_ticket()`

Esto permite que:

- un cliente solo vea tickets de su `empresa_id`
- un transportista solo vea tickets de su `transportista_id`
- un conductor solo vea tickets ligados a su `conductor_id`
- admin y operador tengan visibilidad global

### RPC y logica de negocio

La mutacion sensible no se deja a `update` directos desde cliente. Se encapsula en funciones SQL:

- `set_ticket_status()`
  - valida permisos y registra el historial del cambio
- `assign_ticket()`
  - asigna transportista y conductor respetando limites organizacionales

## 5. Buenas practicas encontradas

- uso de triggers para consistencia y auditoria
- seguridad delegada a PostgreSQL mediante RLS
- SSR y middleware para control de sesion
- logica de negocio separada entre UI, consultas y base de datos
- estructura preparada para evolucionar hacia tracking, GPS, rutas y automatizacion

## 6. Notas de implementacion reales

Aunque el sistema nacio con flujo de magic link, el acceso principal actual se apoya en email + contrasena para reducir dependencia del correo transaccional durante la operacion diaria.

Los archivos mas importantes de referencia son:

- [components/AuthForm.tsx](C:\Users\eigua\OneDrive\Documentos\New project\components\AuthForm.tsx)
- [app/dashboard/page.tsx](C:\Users\eigua\OneDrive\Documentos\New project\app\dashboard\page.tsx)
- [lib/data/tickets.ts](C:\Users\eigua\OneDrive\Documentos\New project\lib\data\tickets.ts)
- [sql/schema.sql](C:\Users\eigua\OneDrive\Documentos\New project\sql\schema.sql)
