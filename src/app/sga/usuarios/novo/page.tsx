import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { UsuarioForm } from "@/components/sga/usuario-form";
import { requireRole, isSgaManagementAvailable } from "@/lib/auth";
import { demoEscolas } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";

export default async function SgaNovoUsuarioPage() {
  const { profile } = await requireRole(["tecnico_sga", "admin_sme"]);
  const sgaManagementAvailable = await isSgaManagementAvailable();

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
        title="Cadastrar usuário"
        description="Crie login e senha para um novo usuário da rede municipal"
      />

      <UsuarioForm
        mode="create"
        escolas={escolas}
        adminAvailable={sgaManagementAvailable}
      />
    </>
  );
}
