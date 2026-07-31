import { listOcorrenciasEscola } from "@/actions/gestor-administracao";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { OcorrenciaForm } from "@/components/gestor/ocorrencia-form";
import { OcorrenciaListItem } from "@/components/gestor/ocorrencia-list-item";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import type { OcorrenciaCategoria } from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

type GestorOcorrenciasViewProps = {
  categoria: OcorrenciaCategoria;
  title: string;
  description: string;
};

export async function GestorOcorrenciasView({
  categoria,
  title,
  description,
}: GestorOcorrenciasViewProps) {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title={title} description={description} />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: turmas }, ocorrencias] = await Promise.all([
    categoria === "alunos"
      ? supabase
          .from("turmas")
          .select("id")
          .eq("escola_id", profile.escola_id)
      : Promise.resolve({ data: [] }),
    listOcorrenciasEscola(profile.escola_id, categoria),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } =
    categoria === "alunos" && turmaIds.length
      ? await supabase
          .from("matriculas")
          .select("aluno_id")
          .in("turma_id", turmaIds)
          .eq("status", "ativa")
      : { data: [] };

  const alunoIds = [...new Set(matriculas?.map((m) => m.aluno_id) ?? [])];

  const { data: alunos } =
    categoria === "alunos" && alunoIds.length
      ? await supabase
          .from("alunos")
          .select("id, nome")
          .in("id", alunoIds)
          .order("nome")
      : { data: [] };

  return (
    <>
      <GestorPageHeader title={title} description={description} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Histórico de ocorrências</CardTitle>
          <CardDescription>{ocorrencias.length} registro(s)</CardDescription>
          <ul className="mt-4 space-y-3">
            {ocorrencias.map((ocorrencia) => (
              <OcorrenciaListItem key={ocorrencia.id} ocorrencia={ocorrencia} />
            ))}
            {ocorrencias.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma ocorrência registrada.
              </li>
            ) : null}
          </ul>
        </Card>

        <OcorrenciaForm
          alunos={alunos ?? []}
          categoria={categoria}
        />
      </div>
    </>
  );
}
