import type { Conductor, Empresa, HistorialEstado, Ticket, Transportista, Usuario } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ticketSelect = `
  id,
  empresa_id,
  transportista_id,
  conductor_id,
  creado_por,
  origen_direccion,
  destino_direccion,
  descripcion,
  tipo_carga,
  estado,
  fecha_retiro,
  fecha_entrega,
  created_at,
  empresa:empresas!tickets_empresa_id_fkey(id, nombre),
  transportista:transportistas!tickets_transportista_id_fkey(id, nombre),
  conductor:conductores!tickets_conductor_id_fkey(id, nombre, telefono, transportista_id),
  creador:usuarios!tickets_creado_por_fkey(id, email, nombre)
`;

export async function getTickets(filters?: {
  estado?: string;
  empresa?: string;
  transportista?: string;
}) {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("tickets").select(ticketSelect).order("created_at", { ascending: false });

  if (filters?.estado) query = query.eq("estado", filters.estado);
  if (filters?.empresa) query = query.eq("empresa_id", filters.empresa);
  if (filters?.transportista) query = query.eq("transportista_id", filters.transportista);

  const { data, error } = await query.returns<Ticket[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTicketById(id: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(ticketSelect)
    .eq("id", id)
    .returns<Ticket>()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTicketHistory(ticketId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("historial_estados")
    .select(
      "id, ticket_id, estado, comentario, cambiado_por, created_at, usuario:usuarios!historial_estados_cambiado_por_fkey(id, email, nombre)"
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
    .returns<HistorialEstado[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getEmpresas() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre")
    .order("nombre", { ascending: true })
    .returns<Empresa[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTransportistas() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("transportistas")
    .select("id, nombre")
    .order("nombre", { ascending: true })
    .returns<Transportista[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getConductores(transportistaId?: string | null) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("conductores")
    .select("id, nombre, telefono, transportista_id")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (transportistaId) query = query.eq("transportista_id", transportistaId);

  const { data, error } = await query.returns<Conductor[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUsuarios() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nombre, rol, empresa_id, transportista_id, conductor_id")
    .order("created_at", { ascending: false })
    .returns<Usuario[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}
