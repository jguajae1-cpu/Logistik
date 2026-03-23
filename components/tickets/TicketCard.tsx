import Link from "next/link";
import type { Ticket } from "@/types";
import { formatDate } from "@/lib/utils";
import { statusLabels } from "@/lib/constants";

type Props = {
  ticket: Ticket;
};

export function TicketCard({ ticket }: Props) {
  return (
    <article className="card ticket-card">
      <div className="ticket-card-header">
        <div>
          <p className="eyebrow">Ticket</p>
          <h3>#{ticket.id.slice(0, 8)}</h3>
        </div>
        <span className={`status status-${ticket.estado}`}>{statusLabels[ticket.estado]}</span>
      </div>

      <div className="ticket-grid">
        <div>
          <span className="label">Origen</span>
          <p>{ticket.origen_direccion}</p>
        </div>
        <div>
          <span className="label">Destino</span>
          <p>{ticket.destino_direccion}</p>
        </div>
        <div>
          <span className="label">Empresa</span>
          <p>{ticket.empresa?.nombre ?? "Sin empresa"}</p>
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
          <span className="label">Creado</span>
          <p>{formatDate(ticket.created_at)}</p>
        </div>
      </div>

      <p>{ticket.descripcion}</p>

      <div className="ticket-card-footer">
        <span className="pill">{ticket.tipo_carga}</span>
        <Link className="button button-secondary" href={`/tickets/${ticket.id}`}>
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
