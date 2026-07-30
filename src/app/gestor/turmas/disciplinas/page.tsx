import { AtribuicaoForm } from "@/components/gestor/atribuicao-form";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VinculosTurmaView } from "@/components/gestor/vinculos-turma-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  agruparVinculosPorTurma,
  getOpcoesAtribuicao,
  getVinculosDocentes,
} from "@/lib/gestor-turmas";

export default async function GestorVincularDisciplinasPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const [vinculos, opcoes] = await Promise.all([
    getVinculosDocentes(profile),
    getOpcoesAtribuicao(profile),
  ]);

  const turmas = agruparVinculosPorTurma(vinculos);

  return (
    <>
      <GestorPageHeader
        title="Vincular Disciplinas"
        description="Disciplinas vinculadas a cada turma da unidade escolar"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {opcoes.anoLetivoId ? (
          <AtribuicaoForm
            professores={opcoes.professores}
            disciplinas={opcoes.disciplinas}
            turmas={opcoes.turmas}
            anoLetivoId={opcoes.anoLetivoId}
          />
        ) : (
          <Card>
            <CardTitle>Ano letivo não configurado</CardTitle>
            <CardDescription className="mt-2">
              Solicite ao administrador SME a ativação do calendário letivo para
              vincular disciplinas.
            </CardDescription>
          </Card>
        )}

        <Card>
          <CardTitle>Resumo</CardTitle>
          <CardDescription className="mt-2">
            {turmas.length} turma(s) com disciplinas vinculadas •{" "}
            {vinculos.length} vínculo(s) no total.
          </CardDescription>
        </Card>
      </div>

      <div className="mt-8">
        <VinculosTurmaView
          turmas={turmas}
          mostrarEscola={profile.role === "admin_sme"}
          emptyTitle="Nenhuma disciplina vinculada"
          emptyDescription="Use o formulário acima para vincular professor, disciplina e turma."
        />
      </div>
    </>
  );
}
