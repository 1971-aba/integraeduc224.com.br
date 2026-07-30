import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FichaResponsavelBranco } from "@/components/gestor/ficha-responsavel-branco";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function FichaResponsavelBrancoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Ficha em Branco"
          description="Formulário impresso para cadastro de responsável"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: escola }, { data: secretaria }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    profile.secretaria_id
      ? supabase
          .from("secretarias")
          .select("nome, municipio, uf")
          .eq("id", profile.secretaria_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <>
      <div className="print:hidden">
        <GestorPageHeader
          title="Ficha em Branco"
          description="Formulário impresso para cadastro de responsável"
          actions={
            <Link
              href="/gestor/alunos/outras-opcoes/complementares/responsaveis"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Preencher no sistema
            </Link>
          }
        />
      </div>

      <FichaResponsavelBranco
        escolaNome={escola?.nome ?? "Unidade Escolar"}
        secretariaNome={secretaria?.nome ?? "Secretaria Municipal de Educação"}
        municipio={
          secretaria ? `${secretaria.municipio}-${secretaria.uf}` : "Município"
        }
      />
    </>
  );
}
