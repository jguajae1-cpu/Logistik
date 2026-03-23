"use client";

import { useMemo, useState } from "react";
import type { AppRole, Conductor, Empresa, Transportista, Usuario } from "@/types";
import { roleLabels } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  usuarios: Usuario[];
  empresas: Empresa[];
  transportistas: Transportista[];
  conductores: Conductor[];
};

type DraftMap = Record<
  string,
  {
    rol: AppRole;
    empresa_id: string;
    transportista_id: string;
    conductor_id: string;
  }
>;

export function UserManagement({ usuarios, empresas, transportistas, conductores }: Props) {
  const [drafts, setDrafts] = useState<DraftMap>(() =>
    Object.fromEntries(
      usuarios.map((usuario) => [
        usuario.id,
        {
          rol: usuario.rol,
          empresa_id: usuario.empresa_id ?? "",
          transportista_id: usuario.transportista_id ?? "",
          conductor_id: usuario.conductor_id ?? ""
        }
      ])
    )
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = useMemo<AppRole[]>(
    () => ["admin", "operador", "cliente", "transportista", "conductor"],
    []
  );

  async function saveUser(userId: string) {
    setSavingId(userId);
    setMessage(null);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const draft = drafts[userId];
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({
        rol: draft.rol,
        empresa_id: draft.empresa_id || null,
        transportista_id: draft.transportista_id || null,
        conductor_id: draft.conductor_id || null
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setSavingId(null);
      return;
    }

    setMessage("Usuario actualizado correctamente.");
    setSavingId(null);
  }

  return (
    <section className="card filters">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Gestión</p>
          <h2>GestionUsuarios</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Empresa</th>
              <th>Transportista</th>
              <th>Conductor</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>
                  <select
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [usuario.id]: {
                          ...current[usuario.id],
                          rol: event.target.value as AppRole
                        }
                      }))
                    }
                    value={drafts[usuario.id]?.rol ?? usuario.rol}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [usuario.id]: {
                          ...current[usuario.id],
                          empresa_id: event.target.value
                        }
                      }))
                    }
                    value={drafts[usuario.id]?.empresa_id ?? ""}
                  >
                    <option value="">Sin empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [usuario.id]: {
                          ...current[usuario.id],
                          transportista_id: event.target.value
                        }
                      }))
                    }
                    value={drafts[usuario.id]?.transportista_id ?? ""}
                  >
                    <option value="">Sin transportista</option>
                    {transportistas.map((transportista) => (
                      <option key={transportista.id} value={transportista.id}>
                        {transportista.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [usuario.id]: {
                          ...current[usuario.id],
                          conductor_id: event.target.value
                        }
                      }))
                    }
                    value={drafts[usuario.id]?.conductor_id ?? ""}
                  >
                    <option value="">Sin conductor</option>
                    {conductores
                      .filter((conductor) => {
                        const selectedTransportista = drafts[usuario.id]?.transportista_id ?? "";
                        return !selectedTransportista || conductor.transportista_id === selectedTransportista;
                      })
                      .map((conductor) => (
                        <option key={conductor.id} value={conductor.id}>
                          {conductor.nombre}
                        </option>
                      ))}
                  </select>
                </td>
                <td>
                  <button
                    className="button button-secondary"
                    disabled={savingId === usuario.id}
                    onClick={() => void saveUser(usuario.id)}
                    type="button"
                  >
                    {savingId === usuario.id ? "Guardando..." : "Guardar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted">
        Los usuarios se crean al primer acceso por magic link y desde aquí puedes editar rol y
        pertenencia operativa.
      </p>
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
