"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(nextPath: string, successMessage: string) {
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

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

    setMessage(successMessage);
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMagicLink("/dashboard", "Revisa tu correo y abre el magic link para ingresar.");
  }

  async function sendRecoveryLink() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/set-password")}`;
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (recoveryError) {
      setError(recoveryError.message);
      setLoading(false);
      return;
    }

    setMessage("Te enviamos un correo para restablecer y crear una nueva contrasena.");
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

      <button
        className="button button-secondary"
        disabled={loading}
        onClick={() =>
          void sendMagicLink(
            "/auth/set-password",
            "Te enviamos un link para iniciar sesion y crear tu contrasena."
          )
        }
        type="button"
      >
        Crear mi contrasena
      </button>

      <button className="button button-secondary" disabled={loading} onClick={() => void sendRecoveryLink()} type="button">
        Restablecer contrasena
      </button>

      <p className="muted">
        Si abriste un link viejo de `localhost`, solicita uno nuevo desde aqui para usar la URL correcta.
      </p>
      <p>
        <Link className="text-link" href="/auth/set-password">
          Ya iniciaste sesion? Define tu contrasena aqui
        </Link>
      </p>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
