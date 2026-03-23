import { redirect } from "next/navigation";
import { SetPasswordForm } from "@/components/SetPasswordForm";
import { getSessionUser } from "@/lib/auth/session";

export default async function SetPasswordPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <main className="auth-page">
      <SetPasswordForm />
    </main>
  );
}
