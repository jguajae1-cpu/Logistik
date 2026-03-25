"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Acceso seguro</p>
        <h1>Ingresa a la operacion</h1>
        <p className="muted">
          Accede con email y contrasena. Si algo falla, debajo tienes magic link y recuperacion.
        </p>
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

      <label className="field">
        <span>Contrasena</span>
        <input
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contrasena"
          required
          type="password"
          value={password}
        />
      </label>

      <button className="button" disabled={loading} type="submit">
        {loading ? "Ingresando..." : "Ingresar con contrasena"}
      </button>

      <button
        className="button button-secondary"
        disabled={loading}
        onClick={() =>
          void sendMagicLink("/dashboard", "Te enviamos un magic link para ingresar sin contrasena.")
        }
        type="button"
      >
        Enviar magic link
      </button>

      <button
        className="button button-secondary"
        disabled={loading}
        onClick={() => void sendRecoveryLink()}
        type="button"
      >
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
