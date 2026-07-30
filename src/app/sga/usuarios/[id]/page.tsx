import { notFound } from "next/navigation";

import { getSgaUsuarioById } from "@/actions/sga-usuarios";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { UsuarioForm } from "@/components/sga/usuario-form";
import { requireRole, isSgaManagementAvailable } from "@/lib/auth";
import { demoEscolas } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";

export default async function SgaEditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);
  const sgaManagementAvailable = await isSgaManagementAvailable();
  const { id } = await params;

  const usuario = await getSgaUsuarioById(id);
  if (!usuario) notFound();

  const supabase = await createClient();
  const { data: escolasDb } = await supabase
    .from("escolas")
    .select("id, nome")
    .eq("ativa", true)
    .order("nome");

  const escolas = [...demoEscolas, ...(escolasDb ?? [])].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );

  return (
    <>
      <GestorPageHeader
        title={`Editar: ${usuario.nome}`}
        description="Atualize dados, perfil, escola vinculada ou redefina a senha"
      />

      <UsuarioForm
        mode="edit"
        escolas={escolas}
        usuario={usuario}
        adminAvailable={sgaManagementAvailable}
      />
    </>
  );
}
