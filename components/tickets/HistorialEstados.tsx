import type { HistorialEstado } from "@/types";
import { formatDate } from "@/lib/utils";
import { statusLabels } from "@/lib/constants";

type Props = {
  items: HistorialEstado[];
};

export function HistorialEstados({ items }: Props) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Seguimiento</p>
          <h2>Historial de estados</h2>
        </div>
      </div>

      <div className="timeline">
        {items.length === 0 && <p className="muted">Aún no hay movimientos registrados.</p>}

        {items.map((item) => (
          <article key={item.id} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-header">
                <strong>{statusLabels[item.estado]}</strong>
                <span>{formatDate(item.created_at)}</span>
              </div>
              <p className="muted">Por: {item.usuario?.nombre ?? "Sistema"}</p>
              {item.comentario && <p>{item.comentario}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
