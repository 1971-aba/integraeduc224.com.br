import { createClient } from "@/lib/supabase/server";
import type { FrequenciaMensalEscola } from "@/lib/gestor-modulos-types";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function calcularPercentual(presentes: number, total: number) {
  if (total === 0) return 0;
  return Math.round((presentes / total) * 1000) / 10;
}

export async function getFrequenciaMensalEscola(
  escolaId: string,
  ano: number,
  mes: number,
): Promise<FrequenciaMensalEscola> {
  const supabase = await createClient();

  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fimDate = new Date(ano, mes, 0);
  const fim = `${ano}-${String(mes).padStart(2, "0")}-${String(fimDate.getDate()).padStart(2, "0")}`;

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, serie")
    .eq("escola_id", escolaId);

  const turmaResults = [];

  for (const turma of turmas ?? []) {
    const { data: matriculas } = await supabase
      .from("matriculas")
      .select("id")
      .eq("turma_id", turma.id)
      .eq("status", "ativa");

    const totalAlunos = matriculas?.length ?? 0;
    if (totalAlunos === 0) continue;

    const { data: atribuicoes } = await supabase
      .from("atribuicoes_docentes")
      .select("id")
      .eq("turma_id", turma.id);

    const atribuicaoIds = atribuicoes?.map((a) => a.id) ?? [];
    if (atribuicaoIds.length === 0) {
      turmaResults.push({
        turmaId: turma.id,
        turmaNome: turma.nome,
        serie: turma.serie,
        totalAlunos,
        totalAulas: 0,
        totalPresentes: 0,
        percentualPresenca: 0,
      });
      continue;
    }

    const { data: chamadas } = await supabase
      .from("chamadas")
      .select("id")
      .in("atribuicao_id", atribuicaoIds)
      .gte("data", inicio)
      .lte("data", fim);

    const chamadaIds = chamadas?.map((c) => c.id) ?? [];
    const totalAulas = chamadaIds.length;

    let totalPresentes = 0;

    if (chamadaIds.length > 0) {
      const matriculaIds = matriculas?.map((m) => m.id) ?? [];
      const { data: registros } = await supabase
        .from("registros_frequencia")
        .select("status")
        .in("chamada_id", chamadaIds)
        .in("matricula_id", matriculaIds);

      totalPresentes =
        registros?.filter((r) => r.status === "presente").length ?? 0;
    }

    const totalPossivel = totalAlunos * totalAulas;

    turmaResults.push({
      turmaId: turma.id,
      turmaNome: turma.nome,
      serie: turma.serie,
      totalAlunos,
      totalAulas,
      totalPresentes,
      percentualPresenca: calcularPercentual(totalPresentes, totalPossivel),
    });
  }

  turmaResults.sort((a, b) =>
    `${a.serie}${a.turmaNome}`.localeCompare(`${b.serie}${b.turmaNome}`, "pt-BR"),
  );

  const totaisAlunos = turmaResults.reduce((acc, t) => acc + t.totalAlunos, 0);
  const totaisAulas = turmaResults.reduce((acc, t) => acc + t.totalAulas, 0);
  const totaisPresentes = turmaResults.reduce(
    (acc, t) => acc + t.totalPresentes,
    0,
  );
  const totalPossivelGeral = turmaResults.reduce(
    (acc, t) => acc + t.totalAlunos * t.totalAulas,
    0,
  );

  return {
    ano,
    mes,
    mesLabel: MESES[mes - 1] ?? String(mes),
    turmas: turmaResults,
    totais: {
      alunos: totaisAlunos,
      aulas: totaisAulas,
      presentes: totaisPresentes,
      percentual: calcularPercentual(totaisPresentes, totalPossivelGeral),
    },
  };
}
