import { DashboardShell } from "@/components/layout/DashboardShell";
import { TicketForm } from "@/components/tickets/TicketForm";
import { requireProfile } from "@/lib/auth/session";
import { getEmpresas } from "@/lib/data/tickets";

export default async function NewTicketPage() {
  const profile = await requireProfile(["admin", "operador", "cliente"]);
  const empresas = await getEmpresas();

  return (
    <DashboardShell profile={profile}>
      <TicketForm empresas={empresas} profile={profile} />
    </DashboardShell>
  );
}
