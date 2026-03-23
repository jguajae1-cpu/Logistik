import Link from "next/link";
import { statusFlow } from "@/lib/constants";

type Props = {
  basePath: string;
  currentStatus?: string;
  empresaOptions?: Array<{ id: string; nombre: string }>;
  transportistaOptions?: Array<{ id: string; nombre: string }>;
  currentEmpresa?: string;
  currentTransportista?: string;
};

export function FiltroTickets({
  basePath,
  currentStatus,
  empresaOptions = [],
  transportistaOptions = [],
  currentEmpresa,
  currentTransportista
}: Props) {
  const buildHref = (params: { estado?: string; empresa?: string; transportista?: string }) => {
    const query = new URLSearchParams();
    if (params.estado) query.set("estado", params.estado);
    if (params.empresa) query.set("empresa", params.empresa);
    if (params.transportista) query.set("transportista", params.transportista);
    const value = query.toString();
    return value ? `${basePath}?${value}` : basePath;
  };

  return (
    <div className="card filters">
      <div className="filter-group">
        <span className="label">Estado</span>
        <div className="filter-list">
          <Link
            className={!currentStatus ? "filter-active" : ""}
            href={buildHref({ empresa: currentEmpresa, transportista: currentTransportista })}
          >
            Todos
          </Link>
          {statusFlow.map((status) => (
            <Link
              key={status}
              className={currentStatus === status ? "filter-active" : ""}
              href={buildHref({
                estado: status,
                empresa: currentEmpresa,
                transportista: currentTransportista
              })}
            >
              {status}
            </Link>
          ))}
        </div>
      </div>

      {empresaOptions.length > 0 && (
        <div className="filter-group">
          <span className="label">Empresa</span>
          <div className="filter-list">
            <Link
              className={!currentEmpresa ? "filter-active" : ""}
              href={buildHref({ estado: currentStatus, transportista: currentTransportista })}
            >
              Todas
            </Link>
            {empresaOptions.map((empresa) => (
              <Link
                key={empresa.id}
                className={currentEmpresa === empresa.id ? "filter-active" : ""}
                href={buildHref({
                  estado: currentStatus,
                  empresa: empresa.id,
                  transportista: currentTransportista
                })}
              >
                {empresa.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}

      {transportistaOptions.length > 0 && (
        <div className="filter-group">
          <span className="label">Transportista</span>
          <div className="filter-list">
            <Link
              className={!currentTransportista ? "filter-active" : ""}
              href={buildHref({ estado: currentStatus, empresa: currentEmpresa })}
            >
              Todos
            </Link>
            {transportistaOptions.map((transportista) => (
              <Link
                key={transportista.id}
                className={currentTransportista === transportista.id ? "filter-active" : ""}
                href={buildHref({
                  estado: currentStatus,
                  empresa: currentEmpresa,
                  transportista: transportista.id
                })}
              >
                {transportista.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
