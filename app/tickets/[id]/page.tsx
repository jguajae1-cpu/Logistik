import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { HistorialEstados } from "@/components/tickets/HistorialEstados";
import { ModalAsignarConductor } from "@/components/tickets/ModalAsignarConductor";
import { StatusActions } from "@/components/tickets/StatusActions";
import { requireProfile } from "@/lib/auth/session";
import { statusLabels } from "@/lib/constants";
import { getConductores, getTicketById, getTicketHistory, getTransportistas } from "@/lib/data/tickets";
import { formatDate } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/types";

const statusOptionsByRole: Record<string, (current: TicketStatus) => TicketStatus[]> = {
  admin: (current) => getForwardStatuses(current),
  operador: (current) => getForwardStatuses(current),
  transportista: (current) => (current === "pendiente" ? ["asignado"] : getForwardStatuses(current)),
  conductor: (current) => getForwardStatuses(current),
  cliente: () => []
};

function getForwardStatuses(current: TicketStatus) {
  const flow: TicketStatus[] = ["pendiente", "asignado", "en_retiro", "en_transito", "entregado"];
  const index = flow.indexOf(current);
  if (index === -1 || index === flow.length - 1) return [current];
  return flow.slice(index + 1, index + 2);
}

type Props = {
  params: { id: string };
};

export default async function TicketDetailPage({ params }: Props) {
  const profile = await requireProfile();
  const ticket: Ticket = await getTicketById(params.id).catch(() => notFound());

  const [history, transportistas, conductores] = await Promise.all([
    getTicketHistory(params.id),
    profile.rol === "admin" || profile.rol === "operador"
      ? getTransportistas()
      : Promise.resolve([] as Awaited<ReturnType<typeof getTransportistas>>),
    getConductores(ticket.transportista_id)
  ]);

  const canAssign =
    profile.rol === "admin" || profile.rol === "operador" || profile.rol === "transportista";
  const statusOptions = statusOptionsByRole[profile.rol](ticket.estado);

  return (
    <DashboardShell profile={profile}>
      <section className="card form-grid">
        <div className="section-heading field-full">
          <div>
            <p className="eyebrow">DetalleTicket{profile.rol[0].toUpperCase() + profile.rol.slice(1)}</p>
            <h1>Ticket #{ticket.id.slice(0, 8)}</h1>
          </div>
          {canAssign && (
            <ModalAsignarConductor
              canSelectTransportista={profile.rol === "admin" || profile.rol === "operador"}
              conductores={conductores}
              ticket={ticket}
              transportistas={transportistas}
            />
          )}
        </div>

        <div className="detail-grid field-full">
          <div>
            <span className="label">Estado</span>
            <p>{statusLabels[ticket.estado]}</p>
          </div>
          <div>
            <span className="label">Empresa</span>
            <p>{ticket.empresa?.nombre ?? "-"}</p>
          </div>
          <div>
            <span className="label">Transportista</span>
            <p>{ticket.transportista?.nombre ?? "Pendiente"}</p>
          </div>
          <div>
            <span className="label">Conductor</span>
            <p>{ticket.conductor?.nombre ?? "Sin asignar"}</p>
          </div>
          <div>
            <span className="label">Fecha retiro</span>
            <p>{formatDate(ticket.fecha_retiro)}</p>
          </div>
          <div>
            <span className="label">Fecha entrega</span>
            <p>{formatDate(ticket.fecha_entrega)}</p>
          </div>
        </div>

        <div className="field">
          <span>Origen</span>
          <p>{ticket.origen_direccion}</p>
        </div>

        <div className="field">
          <span>Destino</span>
          <p>{ticket.destino_direccion}</p>
        </div>

        <div className="field field-full">
          <span>Descripcion</span>
          <p>{ticket.descripcion}</p>
        </div>
      </section>

      {statusOptions.length > 0 && !(statusOptions.length === 1 && statusOptions[0] === ticket.estado) && (
        <StatusActions options={statusOptions} ticket={ticket} />
      )}

      <HistorialEstados items={history} />
    </DashboardShell>
  );
}
