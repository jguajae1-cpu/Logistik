"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Ticket, TicketStatus } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  ticket: Ticket;
  options: TicketStatus[];
};

export function StatusActions({ ticket, options }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(options[0] ?? ticket.estado);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: rpcError } = await supabase.rpc("set_ticket_status", {
      p_ticket_id: ticket.id,
      p_new_status: status,
      p_comment: comment || null
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    setComment("");
    router.refresh();
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="section-heading field-full">
        <div>
          <p className="eyebrow">Cambio de estado</p>
          <h2>Actualizar ticket</h2>
        </div>
      </div>

      <label className="field">
        <span>Siguiente estado</span>
        <select onChange={(event) => setStatus(event.target.value as TicketStatus)} value={status}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-full">
        <span>Comentario</span>
        <textarea
          onChange={(event) => setComment(event.target.value)}
          placeholder="Observación opcional"
          rows={3}
          value={comment}
        />
      </label>

      <div className="actions-row">
        <button className="button" disabled={loading} type="submit">
          {loading ? "Actualizando..." : "Guardar cambio"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </form>
  );
}
