import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TicketCard } from "@/components/tickets/TicketCard";
import { FiltroTickets } from "@/components/tickets/FiltroTickets";
import { UserManagement } from "@/components/UserManagement";
import { requireProfile } from "@/lib/auth/session";
import {
  getConductores,
  getEmpresas,
  getTickets,
  getTransportistas,
  getUsuarios
} from "@/lib/data/tickets";
import { roleLabels } from "@/lib/constants";

type Props = {
  searchParams?: {
    estado?: string;
    empresa?: string;
    transportista?: string;
  };
};

export default async function DashboardPage({ searchParams }: Props) {
  const profile = await requireProfile();
  const [tickets, empresas, transportistas, conductores] = await Promise.all([
    getTickets(searchParams),
    getEmpresas(),
    getTransportistas(),
    profile.rol === "admin" || profile.rol === "operador"
      ? getConductores()
      : Promise.resolve([] as Awaited<ReturnType<typeof getConductores>>)
  ]);
  const usuarios = profile.rol === "admin" || profile.rol === "operador" ? await getUsuarios() : [];

  const stats = {
    total: tickets.length,
    abiertos: tickets.filter((ticket) => ticket.estado !== "entregado").length,
    entregados: tickets.filter((ticket) => ticket.estado === "entregado").length
  };

  const titleByRole = {
    cliente: "DashboardCliente",
    transportista: "DashboardTransportista",
    conductor: "DashboardConductor",
    operador: "DashboardOperador",
    admin: "DashboardAdmin"
  } as const;

  return (
    <DashboardShell profile={profile}>
      <header className="page-header">
        <div>
          <p className="eyebrow">{titleByRole[profile.rol]}</p>
          <h1>{roleLabels[profile.rol]}</h1>
        </div>
        {(profile.rol === "cliente" || profile.rol === "admin" || profile.rol === "operador") && (
          <Link className="button" href="/tickets/new">
            Crear ticket
          </Link>
        )}
      </header>

      <section className="stats-grid">
        <article className="card stats-card">
          <span className="label">Tickets</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="card stats-card">
          <span className="label">En curso</span>
          <strong>{stats.abiertos}</strong>
        </article>
        <article className="card stats-card">
          <span className="label">Entregados</span>
          <strong>{stats.entregados}</strong>
        </article>
      </section>

      <FiltroTickets
        basePath="/dashboard"
        currentEmpresa={searchParams?.empresa}
        currentStatus={searchParams?.estado}
        currentTransportista={searchParams?.transportista}
        empresaOptions={profile.rol === "admin" || profile.rol === "operador" ? empresas : []}
        transportistaOptions={profile.rol === "admin" || profile.rol === "operador" ? transportistas : []}
      />

      <section className="cards-grid">
        {tickets.length === 0 && (
          <article className="card ticket-card">
            <h3>Sin tickets visibles</h3>
            <p className="muted">
              La consulta ya respeta RLS, así que este resultado refleja exactamente lo que puede ver
              tu rol.
            </p>
          </article>
        )}

        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </section>

      {(profile.rol === "admin" || profile.rol === "operador") && (
        <UserManagement
          usuarios={usuarios}
          empresas={empresas}
          transportistas={transportistas}
          conductores={conductores}
        />
      )}
    </DashboardShell>
  );
}
