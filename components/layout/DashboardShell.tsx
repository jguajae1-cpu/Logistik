import Link from "next/link";
import type { ReactNode } from "react";
import type { Usuario } from "@/types";
import { APP_NAME, roleDashboardTitle, roleLabels } from "@/lib/constants";
import { SignOutButton } from "@/components/layout/SignOutButton";

type Props = {
  profile: Usuario;
  children: ReactNode;
};

export function DashboardShell({ profile, children }: Props) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">{APP_NAME}</p>
          <h1>Plataforma logística</h1>
          <p className="muted">{roleDashboardTitle[profile.rol]}</p>
        </div>

        <nav className="nav">
          <Link href="/dashboard">Dashboard</Link>
          {(profile.rol === "cliente" || profile.rol === "admin" || profile.rol === "operador") && (
            <Link href="/tickets/new">Crear ticket</Link>
          )}
          <Link href="/auth/set-password">Crear o cambiar contrasena</Link>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-card">
            <strong>{profile.nombre}</strong>
            <span>{profile.email}</span>
            <span className="pill">{roleLabels[profile.rol]}</span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
