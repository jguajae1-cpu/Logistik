export type AppRole = "admin" | "cliente" | "operador" | "conductor" | "transportista";

export type TicketStatus =
  | "pendiente"
  | "asignado"
  | "en_retiro"
  | "en_transito"
  | "entregado"
  | "cancelado";

export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  rol: AppRole;
  empresa_id: string | null;
  transportista_id: string | null;
  conductor_id: string | null;
};

export type Empresa = {
  id: string;
  nombre: string;
};

export type Transportista = {
  id: string;
  nombre: string;
};

export type Conductor = {
  id: string;
  nombre: string;
  telefono: string | null;
  transportista_id: string;
};

export type Ticket = {
  id: string;
  empresa_id: string;
  transportista_id: string | null;
  conductor_id: string | null;
  creado_por: string;
  origen_direccion: string;
  destino_direccion: string;
  descripcion: string;
  tipo_carga: string;
  estado: TicketStatus;
  fecha_retiro: string | null;
  fecha_entrega: string | null;
  created_at: string;
  empresa?: Empresa | null;
  transportista?: Transportista | null;
  conductor?: Conductor | null;
  creador?: Pick<Usuario, "id" | "email" | "nombre"> | null;
};

export type HistorialEstado = {
  id: string;
  ticket_id: string;
  estado: TicketStatus;
  comentario: string | null;
  cambiado_por: string | null;
  created_at: string;
  usuario?: Pick<Usuario, "id" | "email" | "nombre"> | null;
};
