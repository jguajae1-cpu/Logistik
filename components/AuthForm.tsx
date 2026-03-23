"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setMessage("Revisa tu correo y abre el magic link para ingresar.");
    setLoading(false);
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Acceso seguro</p>
        <h1>Ingresa a la operación</h1>
        <p className="muted">Usa tu email corporativo para recibir un magic link vía Supabase Auth.</p>
      </div>

      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@empresa.com"
          required
          type="email"
          value={email}
        />
      </label>

      <button className="button" disabled={loading} type="submit">
        {loading ? "Enviando..." : "Enviar magic link"}
      </button>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
