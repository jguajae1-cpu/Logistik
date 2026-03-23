"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Conductor, Ticket, Transportista } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  ticket: Ticket;
  transportistas: Transportista[];
  conductores: Conductor[];
  canSelectTransportista: boolean;
};

export function ModalAsignarConductor({
  ticket,
  transportistas,
  conductores,
  canSelectTransportista
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedTransportista, setSelectedTransportista] = useState(ticket.transportista_id ?? "");
  const [selectedConductor, setSelectedConductor] = useState(ticket.conductor_id ?? "");
  const [localConductores, setLocalConductores] = useState(conductores);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadConductores() {
      if (!selectedTransportista) {
        setLocalConductores([]);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error: conductoresError } = await supabase
        .from("conductores")
        .select("id, nombre, telefono, transportista_id")
        .eq("activo", true)
        .eq("transportista_id", selectedTransportista)
        .order("nombre", { ascending: true });

      if (conductoresError) {
        setError(conductoresError.message);
        return;
      }

      setLocalConductores(data ?? []);
    }

    void loadConductores();
  }, [selectedTransportista]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: rpcError } = await supabase.rpc("assign_ticket", {
      p_ticket_id: ticket.id,
      p_transportista_id: selectedTransportista || null,
      p_conductor_id: selectedConductor || null,
      p_comment: "Asignación manual desde dashboard"
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="button button-secondary" onClick={() => setOpen(true)} type="button">
        Asignar conductor
      </button>

      {open && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Asignación manual</p>
                <h3>Asignar transportista y conductor</h3>
              </div>
              <button className="button button-secondary" onClick={() => setOpen(false)} type="button">
                Cerrar
              </button>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              {canSelectTransportista && (
                <label className="field">
                  <span>Transportista</span>
                  <select
                    onChange={(event) => setSelectedTransportista(event.target.value)}
                    required
                    value={selectedTransportista}
                  >
                    <option value="">Selecciona</option>
                    {transportistas.map((transportista) => (
                      <option key={transportista.id} value={transportista.id}>
                        {transportista.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="field">
                <span>Conductor</span>
                <select
                  onChange={(event) => setSelectedConductor(event.target.value)}
                  value={selectedConductor}
                >
                  <option value="">Sin conductor</option>
                  {localConductores.map((conductor) => (
                    <option key={conductor.id} value={conductor.id}>
                      {conductor.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="actions-row">
                <button className="button" disabled={loading} type="submit">
                  {loading ? "Guardando..." : "Confirmar"}
                </button>
                {error && <p className="error-text">{error}</p>}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
