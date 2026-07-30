import { FileText } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getCoordenadorEscolaId } from "@/lib/coordenador-data";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorPlanosPage() {
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const escolaId = getCoordenadorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Planos de Aula"
          description="Planos produzidos pelos professores da escola"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const { data: professores } = await supabase
    .from("profiles")
    .select("id, nome")
    .eq("escola_id", escolaId)
    .eq("role", "professor");

  const professorIds = professores?.map((professor) => professor.id) ?? [];
  const professorNomes = new Map(
    professores?.map((professor) => [professor.id, professor.nome]) ?? [],
  );

  const { data: planos } = professorIds.length
    ? await supabase
        .from("planos_aula")
        .select("id, tema, serie, disciplina, professor_id, updated_at")
        .in("professor_id", professorIds)
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <>
      <GestorPageHeader
        title="Planos de Aula"
        description="Consulta dos planos produzidos pelos professores da escola"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {planos?.map((plano) => (
          <Card key={plano.id}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="line-clamp-2">{plano.tema}</CardTitle>
            <CardDescription>
              {plano.serie}
              {plano.disciplina ? ` • ${plano.disciplina}` : ""}
            </CardDescription>
            <p className="mt-3 text-sm text-slate-600">
              {professorNomes.get(plano.professor_id) ?? "Professor"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Atualizado em{" "}
              {new Date(plano.updated_at).toLocaleDateString("pt-BR")}
            </p>
          </Card>
        )) ?? null}

        {(!planos || planos.length === 0) && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardTitle>Nenhum plano encontrado</CardTitle>
            <CardDescription className="mt-2">
              Os professores da escola ainda não produziram planos de aula na
              plataforma.
            </CardDescription>
          </Card>
        )}
      </div>
    </>
  );
}
