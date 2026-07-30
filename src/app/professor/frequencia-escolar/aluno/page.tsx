import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAlunoView } from "@/components/professor/frequencia-aluno-view";
import { requireRole } from "@/lib/auth";
import { getProfessorAtribuicoes } from "@/lib/diario";
import {
  filtrarPorTexto,
  flattenFrequenciaAlunos,
} from "@/lib/professor-frequencia-escolar";
import { getFrequenciaConsolidada } from "@/lib/professor-diario";

export default async function FrequenciaAlunoPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; q?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const resumos = await getFrequenciaConsolidada(
    profile.id,
    params.bimestre,
    "bimestre",
  );

  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const atribuicoesAtivas = atribuicoes
    .filter((item) => item.anos_letivos?.ativo)
    .map((item) => ({
      id: item.id,
      label: `${item.disciplinas?.nome} — ${item.turmas?.nome} (${item.turmas?.serie})`,
    }));

  let resumosFiltrados = resumos;
  if (params.turma) {
    resumosFiltrados = resumosFiltrados.filter(
      (item) => item.atribuicaoId === params.turma,
    );
  }

  const linhas = filtrarPorTexto(
    flattenFrequenciaAlunos(resumosFiltrados),
    params.q,
    ["nome", "turma", "disciplina", "serie"],
  );

  return (
    <>
      <GestorPageHeader
        title="Frequência Aluno"
        description="Consulta individual de presença por estudante nas suas turmas"
      />
      <FrequenciaAlunoView
        linhas={linhas}
        atribuicoes={atribuicoesAtivas}
        atribuicaoId={params.turma}
        busca={params.q}
      />
    </>
  );
}
