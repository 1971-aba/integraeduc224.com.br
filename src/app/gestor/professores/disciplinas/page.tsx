import { AtribuicaoForm } from "@/components/gestor/atribuicao-form";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VinculosProfessorView } from "@/components/gestor/vinculos-professor-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  agruparVinculosPorProfessor,
  getOpcoesAtribuicao,
  getVinculosDocentes,
} from "@/lib/gestor-turmas";

export default async function VinculandoDisciplinasPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const [vinculos, opcoes] = await Promise.all([
    getVinculosDocentes(profile),
    getOpcoesAtribuicao(profile),
  ]);

  const professores = agruparVinculosPorProfessor(vinculos);

  return (
    <>
      <GestorPageHeader
        title="Vinculando Disciplinas"
        description="Atribua professores às disciplinas e turmas da unidade"
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
            {professores.length} professor(es) com disciplinas vinculadas •{" "}
            {vinculos.length} vínculo(s) no total.
          </CardDescription>
        </Card>
      </div>

      <div className="mt-8">
        <VinculosProfessorView
          professores={professores}
          emptyTitle="Nenhum professor vinculado"
          emptyDescription="Use o formulário acima para vincular professor, disciplina e turma."
        />
      </div>
    </>
  );
}
