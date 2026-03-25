import type { AppRole, TicketStatus } from "@/types";

export const APP_NAME = "LogiFlow";

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  cliente: "Cliente",
  operador: "Operador",
  conductor: "Conductor",
  transportista: "Transportista"
};

export const statusLabels: Record<TicketStatus, string> = {
  pendiente: "Pendiente",
  asignado: "Asignado",
  en_retiro: "En retiro",
  en_transito: "En transito",
  entregado: "Entregado",
  cancelado: "Cancelado"
};

export const statusFlow: TicketStatus[] = [
  "pendiente",
  "asignado",
  "en_retiro",
  "en_transito",
  "entregado"
];

export const roleDashboardTitle: Record<AppRole, string> = {
  admin: "Panel global de la plataforma",
  operador: "Operacion logistica central",
  cliente: "Solicitudes de tu empresa",
  transportista: "Asignaciones para tu transportista",
  conductor: "Viajes asignados"
};
