"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Empresa, Usuario } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  profile: Usuario;
  empresas: Empresa[];
};

export function TicketForm({ profile, empresas }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const empresaId =
      profile.rol === "cliente" ? profile.empresa_id : String(formData.get("empresa_id") || "");

    const supabase = getSupabaseBrowserClient();
    const payload = {
      empresa_id: empresaId,
      creado_por: profile.id,
      origen_direccion: String(formData.get("origen_direccion") || ""),
      destino_direccion: String(formData.get("destino_direccion") || ""),
      descripcion: String(formData.get("descripcion") || ""),
      tipo_carga: String(formData.get("tipo_carga") || ""),
      fecha_retiro: String(formData.get("fecha_retiro") || "") || null,
      fecha_entrega: String(formData.get("fecha_entrega") || "") || null
    };

    const { data, error: insertError } = await supabase
      .from("tickets")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/tickets/${data.id}`);
    router.refresh();
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="section-heading field-full">
        <div>
          <p className="eyebrow">Nuevo ticket</p>
          <h1>Crear solicitud logística</h1>
        </div>
      </div>

      {(profile.rol === "admin" || profile.rol === "operador") && (
        <label className="field">
          <span>Empresa</span>
          <select defaultValue="" name="empresa_id" required>
            <option disabled value="">
              Selecciona una empresa
            </option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="field">
        <span>Origen</span>
        <input name="origen_direccion" placeholder="Centro de distribución A" required />
      </label>

      <label className="field">
        <span>Destino</span>
        <input name="destino_direccion" placeholder="Sucursal B" required />
      </label>

      <label className="field">
        <span>Tipo de carga</span>
        <input name="tipo_carga" placeholder="Electrónica, pallets, refrigerado..." required />
      </label>

      <label className="field field-full">
        <span>Descripción</span>
        <textarea name="descripcion" placeholder="Detalle operativo de la solicitud" required rows={5} />
      </label>

      <label className="field">
        <span>Fecha retiro</span>
        <input name="fecha_retiro" type="datetime-local" />
      </label>

      <label className="field">
        <span>Fecha entrega</span>
        <input name="fecha_entrega" type="datetime-local" />
      </label>

      <div className="actions-row">
        <button className="button" disabled={loading} type="submit">
          {loading ? "Creando..." : "Crear ticket"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </form>
  );
}
