"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      setHasSession(Boolean(session));
      setReady(true);
    }

    void checkSession();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage("Contrasena guardada correctamente. Redirigiendo al dashboard...");
    setLoading(false);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 900);
  }

  if (!ready) {
    return (
      <section className="card auth-card">
        <p className="muted">Validando sesion...</p>
      </section>
    );
  }

  if (!hasSession) {
    return (
      <section className="card auth-card">
        <div>
          <p className="eyebrow">Sesion requerida</p>
          <h1>Abre el link del correo</h1>
          <p className="muted">
            Para crear o restablecer contrasena necesitas entrar desde el link de email.
          </p>
        </div>
        <Link className="button" href="/login">
          Ir a login
        </Link>
      </section>
    );
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Seguridad de cuenta</p>
        <h1>Crea tu contrasena</h1>
        <p className="muted">
          Define una contrasena para poder iniciar sesion despues con email + contrasena.
        </p>
      </div>

      <label className="field">
        <span>Nueva contrasena</span>
        <input
          autoComplete="new-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>

      <label className="field">
        <span>Confirmar contrasena</span>
        <input
          autoComplete="new-password"
          minLength={8}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          type="password"
          value={confirmPassword}
        />
      </label>

      <button className="button" disabled={loading} type="submit">
        {loading ? "Guardando..." : "Guardar contrasena"}
      </button>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
