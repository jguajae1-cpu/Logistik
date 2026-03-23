import { redirect } from "next/navigation";
import type { AppRole, Usuario } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile(): Promise<Usuario | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nombre, rol, empresa_id, transportista_id, conductor_id")
    .eq("id", user.id)
    .returns<Usuario>()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function requireProfile(allowedRoles?: AppRole[]): Promise<Usuario> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (allowedRoles && !allowedRoles.includes(profile.rol)) {
    redirect("/dashboard");
  }

  return profile;
}
