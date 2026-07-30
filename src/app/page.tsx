import { redirect } from "next/navigation";

import { getDashboardPath, getSessionProfile } from "@/lib/auth";

export default async function HomePage() {
  const { profile } = await getSessionProfile();

  if (profile?.ativo) {
    redirect(getDashboardPath(profile.role));
  }

  redirect("/login");
}
