import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FichaMedicaBranco } from "@/components/gestor/ficha-medica-branco";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function FichaMedicaBrancoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const [{ data: escola }, { data: secretaria }] = await Promise.all([
    profile.escola_id
      ? supabase
          .from("escolas")
          .select("nome")
          .eq("id", profile.escola_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
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
          title="Ficha Médica em Branco"
          description="Formulário para impressão e preenchimento à mão pelo responsável"
          actions={
            <Link
              href="/gestor/alunos/ficha-medica"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Preencher no sistema
            </Link>
          }
        />
      </div>

      <FichaMedicaBranco
        escolaNome={escola?.nome ?? "Unidade Escolar"}
        secretariaNome={secretaria?.nome ?? "Secretaria Municipal de Educação"}
        municipio={
          secretaria ? `${secretaria.municipio}-${secretaria.uf}` : "Município"
        }
      />
    </>
  );
}
