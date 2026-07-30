import { createClient } from "@/lib/supabase/server";
import {
  getProfessorAtribuicoes,
  validateDiaLetivo,
} from "@/lib/diario";
import { isDevProfileId } from "@/lib/dev-auth";
import { formatDateInput } from "@/lib/diario-utils";
import type { PresencaStatus } from "@/types/database";

export type DiarioPendencia = {
  atribuicaoId: string;
  disciplina: string;
  turma: string;
  serie: string;
  turno: string;
  data: string;
  diaLetivo: boolean;
  chamadaRegistrada: boolean;
  conteudoRegistrado: boolean;
  pendente: boolean;
};

export type FrequenciaAlunoResumo = {
  matriculaId: string;
  nome: string;
  totalAulas: number;
  presentes: number;
  faltas: number;
  justificadas: number;
  percentualPresenca: number;
};

export type FrequenciaTurmaResumo = {
  atribuicaoId: string;
  turmaId: string;
  disciplinaId: string;
  disciplina: string;
  turma: string;
  serie: string;
  turno: string;
  periodoLabel: string;
  totalAlunos: number;
  totalAulasRegistradas: number;
  percentualPresencaTurma: number;
  alunos: FrequenciaAlunoResumo[];
};

export type FrequenciaPercentualFiltro = {
  tipo?: "lte" | "between";
  max?: number;
  min?: number;
  maxRange?: number;
};

function calcularPercentual(presentes: number, total: number) {
  if (total === 0) return 0;
  return Math.round((presentes / total) * 1000) / 10;
}

export async function getDiarioPendencias(
  professorId: string,
  dataReferencia?: string,
): Promise<DiarioPendencia[]> {
  const data = dataReferencia ?? new Date().toISOString().slice(0, 10);
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const turmasAtivas = atribuicoes.filter((item) => item.anos_letivos?.ativo);

  if (turmasAtivas.length === 0) return [];

  const supabase = await createClient();
  const atribuicaoIds = turmasAtivas.map((item) => item.id);

  const [{ data: chamadas }, { data: conteudos }] = await Promise.all([
    supabase
      .from("chamadas")
      .select("atribuicao_id")
      .in("atribuicao_id", atribuicaoIds)
      .eq("data", data),
    supabase
      .from("conteudos_diarios")
      .select("atribuicao_id")
      .in("atribuicao_id", atribuicaoIds)
      .eq("data", data),
  ]);

  const chamadasSet = new Set(chamadas?.map((item) => item.atribuicao_id) ?? []);
  const conteudosSet = new Set(conteudos?.map((item) => item.atribuicao_id) ?? []);

  const pendencias: DiarioPendencia[] = [];

  for (const atribuicao of turmasAtivas) {
    let diaLetivo = false;
    try {
      diaLetivo = await validateDiaLetivo(data, atribuicao.ano_letivo_id);
    } catch {
      diaLetivo = isDevProfileId(professorId);
    }
    const chamadaRegistrada = chamadasSet.has(atribuicao.id);
    const conteudoRegistrado = conteudosSet.has(atribuicao.id);
    const pendente =
      diaLetivo && (!chamadaRegistrada || !conteudoRegistrado);

    pendencias.push({
      atribuicaoId: atribuicao.id,
      disciplina: atribuicao.disciplinas?.nome ?? "Disciplina",
      turma: atribuicao.turmas?.nome ?? "Turma",
      serie: atribuicao.turmas?.serie ?? "—",
      turno: atribuicao.turmas?.turno ?? "—",
      data,
      diaLetivo,
      chamadaRegistrada,
      conteudoRegistrado,
      pendente,
    });
  }

  return pendencias.sort((a, b) => {
    if (a.pendente !== b.pendente) return a.pendente ? -1 : 1;
    return a.disciplina.localeCompare(b.disciplina, "pt-BR");
  });
}

export async function getFrequenciaConsolidada(
  professorId: string,
  bimestreId?: string,
  escopo: "bimestre" | "anual" = "bimestre",
): Promise<FrequenciaTurmaResumo[]> {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const turmasAtivas = atribuicoes.filter((item) => item.anos_letivos?.ativo);

  if (turmasAtivas.length === 0) return [];

  const supabase = await createClient();
  const resumos: FrequenciaTurmaResumo[] = [];

  for (const atribuicao of turmasAtivas) {
    let periodoLabel = escopo === "anual" ? "Ano letivo" : "Período letivo";
    let dataInicio: string | null = null;
    let dataFim: string | null = null;

    if (escopo === "bimestre") {
      if (bimestreId) {
        const { data: bimestre } = await supabase
          .from("bimestres")
          .select("numero, data_inicio, data_fim")
          .eq("id", bimestreId)
          .maybeSingle();

        if (bimestre) {
          periodoLabel = `${bimestre.numero}º bimestre`;
          dataInicio = bimestre.data_inicio;
          dataFim = bimestre.data_fim;
        }
      } else {
        const { data: bimestreAtual } = await supabase
          .from("bimestres")
          .select("numero, data_inicio, data_fim")
          .eq("ano_letivo_id", atribuicao.ano_letivo_id)
          .lte("data_inicio", new Date().toISOString().slice(0, 10))
          .gte("data_fim", new Date().toISOString().slice(0, 10))
          .maybeSingle();

        if (bimestreAtual) {
          periodoLabel = `${bimestreAtual.numero}º bimestre (atual)`;
          dataInicio = bimestreAtual.data_inicio;
          dataFim = bimestreAtual.data_fim;
        }
      }
    }

    let chamadasQuery = supabase
      .from("chamadas")
      .select("id, data")
      .eq("atribuicao_id", atribuicao.id);

    if (dataInicio && dataFim) {
      chamadasQuery = chamadasQuery
        .gte("data", dataInicio)
        .lte("data", dataFim);
    }

    const { data: chamadas } = await chamadasQuery.order("data");
    const chamadaIds = chamadas?.map((item) => item.id) ?? [];

    const { data: matriculas } = await supabase
      .from("matriculas")
      .select("id, aluno_id")
      .eq("turma_id", atribuicao.turma_id)
      .eq("status", "ativa");

    const alunoIds = matriculas?.map((item) => item.aluno_id) ?? [];
    const { data: alunos } = alunoIds.length
      ? await supabase.from("alunos").select("id, nome").in("id", alunoIds)
      : { data: [] as Array<{ id: string; nome: string }> };

    const { data: registros } = chamadaIds.length
      ? await supabase
          .from("registros_frequencia")
          .select("matricula_id, status")
          .in("chamada_id", chamadaIds)
      : { data: [] as Array<{ matricula_id: string; status: PresencaStatus }> };

    const alunosResumo: FrequenciaAlunoResumo[] = (matriculas ?? []).map(
      (matricula) => {
        const registrosAluno =
          registros?.filter((item) => item.matricula_id === matricula.id) ?? [];
        const presentes = registrosAluno.filter(
          (item) => item.status === "presente",
        ).length;
        const faltas = registrosAluno.filter(
          (item) => item.status === "falta",
        ).length;
        const justificadas = registrosAluno.filter(
          (item) => item.status === "justificada",
        ).length;
        const totalAulas = chamadaIds.length;

        return {
          matriculaId: matricula.id,
          nome:
            alunos?.find((aluno) => aluno.id === matricula.aluno_id)?.nome ??
            "Aluno",
          totalAulas,
          presentes,
          faltas,
          justificadas,
          percentualPresenca: calcularPercentual(presentes, totalAulas),
        };
      },
    );

    alunosResumo.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const totalPresentes = alunosResumo.reduce(
      (acc, aluno) => acc + aluno.presentes,
      0,
    );
    const totalPossivel = alunosResumo.length * chamadaIds.length;

    resumos.push({
      atribuicaoId: atribuicao.id,
      turmaId: atribuicao.turma_id,
      disciplinaId: atribuicao.disciplina_id,
      disciplina: atribuicao.disciplinas?.nome ?? "Disciplina",
      turma: atribuicao.turmas?.nome ?? "Turma",
      serie: atribuicao.turmas?.serie ?? "—",
      turno: atribuicao.turmas?.turno ?? "—",
      periodoLabel,
      totalAlunos: alunosResumo.length,
      totalAulasRegistradas: chamadaIds.length,
      percentualPresencaTurma: calcularPercentual(totalPresentes, totalPossivel),
      alunos: alunosResumo,
    });
  }

  return resumos;
}

export async function getFrequenciaAnualConsolidada(professorId: string) {
  return getFrequenciaConsolidada(professorId, undefined, "anual");
}

export async function getProfessorBimestreOptions(professorId: string) {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const anoIds = [
    ...new Set(
      atribuicoes
        .filter((item) => item.anos_letivos?.ativo)
        .map((item) => item.ano_letivo_id),
    ),
  ];

  if (anoIds.length === 0) return [];

  const supabase = await createClient();
  const { data: bimestres } = await supabase
    .from("bimestres")
    .select("id, numero, ano_letivo_id")
    .in("ano_letivo_id", anoIds)
    .order("numero");

  return (bimestres ?? []).map((item) => ({
    id: item.id,
    label: `${item.numero}º bimestre`,
  }));
}

export function formatPendenciaData(data: string) {
  return formatDateInput(data);
}

export async function countPendenciasDiario(professorId: string) {
  const pendencias = await getDiarioPendencias(professorId);
  return pendencias.filter((item) => item.pendente).length;
}

export type BimestreComDatas = {
  id: string;
  numero: number;
  data_inicio: string;
  data_fim: string;
  ano_letivo_id: string;
};

export async function getProfessorBimestresComDatas(
  professorId: string,
): Promise<BimestreComDatas[]> {
  const atribuicoes = await getProfessorAtribuicoes(professorId);
  const anoIds = [
    ...new Set(
      atribuicoes
        .filter((item) => item.anos_letivos?.ativo)
        .map((item) => item.ano_letivo_id),
    ),
  ];

  if (anoIds.length === 0) return [];

  const supabase = await createClient();
  const { data: bimestres } = await supabase
    .from("bimestres")
    .select("id, numero, data_inicio, data_fim, ano_letivo_id")
    .in("ano_letivo_id", anoIds)
    .order("numero");

  return bimestres ?? [];
}

function diasDesde(dataReferencia: string, hoje: string) {
  const inicio = new Date(`${dataReferencia}T12:00:00`);
  const fim = new Date(`${hoje}T12:00:00`);
  return Math.max(
    0,
    Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function formatarDataCurta(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export async function getBimestreEncerradoAlert(professorId: string) {
  const bimestres = await getProfessorBimestresComDatas(professorId);
  if (bimestres.length === 0) return null;

  const hoje = new Date().toISOString().slice(0, 10);
  const bimestreAtual = bimestres.find(
    (item) => item.data_inicio <= hoje && item.data_fim >= hoje,
  );

  if (bimestreAtual) return null;

  const encerrados = bimestres
    .filter((item) => item.data_fim < hoje)
    .sort((a, b) => b.data_fim.localeCompare(a.data_fim));

  if (encerrados.length === 0) return null;

  const ultimoEncerrado = encerrados[0];
  const dias = diasDesde(ultimoEncerrado.data_fim, hoje);
  const diaLabel = dias === 1 ? "1 dia" : `${dias} dias`;

  return {
    id: "alert-bimestre-prazo",
    message: `Você permanece no ${ultimoEncerrado.numero}º PERÍODO cujo prazo encerrou há ${diaLabel} em (${formatarDataCurta(ultimoEncerrado.data_fim)})!`,
  };
}

export function filtrarFrequenciaPorPercentual(
  resumos: FrequenciaTurmaResumo[],
  filtro: FrequenciaPercentualFiltro,
): FrequenciaTurmaResumo[] {
  if (!filtro.tipo) return resumos;

  return resumos
    .map((turma) => {
      let alunos = turma.alunos;

      if (filtro.tipo === "lte" && filtro.max != null && !Number.isNaN(filtro.max)) {
        alunos = alunos.filter((aluno) => aluno.percentualPresenca <= filtro.max!);
      }

      if (
        filtro.tipo === "between" &&
        filtro.min != null &&
        filtro.maxRange != null &&
        !Number.isNaN(filtro.min) &&
        !Number.isNaN(filtro.maxRange)
      ) {
        const min = Math.min(filtro.min, filtro.maxRange);
        const max = Math.max(filtro.min, filtro.maxRange);
        alunos = alunos.filter(
          (aluno) =>
            aluno.percentualPresenca >= min && aluno.percentualPresenca <= max,
        );
      }

      return { ...turma, alunos };
    })
    .filter((turma) => turma.alunos.length > 0);
}

export function parseFrequenciaPercentualFiltro(searchParams: {
  tipo?: string;
  max?: string;
  min?: string;
  maxRange?: string;
}): FrequenciaPercentualFiltro {
  const tipo =
    searchParams.tipo === "lte" || searchParams.tipo === "between"
      ? searchParams.tipo
      : undefined;

  return {
    tipo,
    max: searchParams.max ? Number(searchParams.max) : undefined,
    min: searchParams.min ? Number(searchParams.min) : undefined,
    maxRange: searchParams.maxRange ? Number(searchParams.maxRange) : undefined,
  };
}
