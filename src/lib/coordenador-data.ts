import type { SupabaseClient } from "@supabase/supabase-js";

import { getAlunosEvasao } from "@/lib/bi";
import type { AlunoEvasao } from "@/lib/bi-types";
import { validateDiaLetivo } from "@/lib/diario";
import { isDevProfileId } from "@/lib/dev-auth";
import { createClient } from "@/lib/supabase/server";
import type { Database, PresencaStatus, Profile } from "@/types/database";

import type {
  DiarioPendencia,
  FrequenciaAlunoResumo,
  FrequenciaTurmaResumo,
} from "./professor-diario";

export type DiarioPendenciaEscola = DiarioPendencia & {
  professorId: string;
  professorNome: string;
};

export type EscolaAtribuicao = {
  id: string;
  professorId: string;
  professorNome: string;
  disciplina: string;
  turma: string;
  serie: string;
  turno: string;
};

export type EscolaResumo = {
  alunosMatriculados: number;
  professores: number;
  turmas: number;
  atribuicoes: number;
  pendenciasHoje: number;
};

export function getCoordenadorEscolaId(profile: Profile) {
  return profile.escola_id;
}

export async function getEscolaTurmaIds(
  supabase: SupabaseClient<Database>,
  escolaId: string,
) {
  const { data: turmas } = await supabase
    .from("turmas")
    .select("id")
    .eq("escola_id", escolaId);

  return turmas?.map((turma) => turma.id) ?? [];
}

export async function getEscolaAtribuicoes(
  supabase: SupabaseClient<Database>,
  escolaId: string,
): Promise<EscolaAtribuicao[]> {
  const turmaIds = await getEscolaTurmaIds(supabase, escolaId);

  if (turmaIds.length === 0) {
    return [];
  }

  const { data: atribuicoesRaw } = await supabase
    .from("atribuicoes_docentes")
    .select("id, professor_id, turma_id, disciplina_id")
    .in("turma_id", turmaIds)
    .order("created_at", { ascending: false });

  if (!atribuicoesRaw?.length) {
    return [];
  }

  const professorIds = [
    ...new Set(atribuicoesRaw.map((item) => item.professor_id)),
  ];
  const disciplinaIds = [
    ...new Set(atribuicoesRaw.map((item) => item.disciplina_id)),
  ];

  const [{ data: professores }, { data: turmas }, { data: disciplinas }] =
    await Promise.all([
      supabase.from("profiles").select("id, nome").in("id", professorIds),
      supabase
        .from("turmas")
        .select("id, nome, serie, turno")
        .in("id", turmaIds),
      supabase.from("disciplinas").select("id, nome").in("id", disciplinaIds),
    ]);

  return atribuicoesRaw.map((item) => {
    const professor = professores?.find((p) => p.id === item.professor_id);
    const turma = turmas?.find((t) => t.id === item.turma_id);
    const disciplina = disciplinas?.find((d) => d.id === item.disciplina_id);

    return {
      id: item.id,
      professorId: item.professor_id,
      professorNome: professor?.nome ?? "Professor",
      disciplina: disciplina?.nome ?? "Disciplina",
      turma: turma?.nome ?? "Turma",
      serie: turma?.serie ?? "—",
      turno: turma?.turno ?? "—",
    };
  });
}

export function mapEscolaAtribuicoesTurmas(
  atribuicoes: EscolaAtribuicao[],
): Array<{
  id: string;
  disciplina: string;
  turma: string;
  serie: string;
  turno: string;
  anoLetivo: number | null;
  detalhe?: string;
}> {
  return atribuicoes.map((item) => ({
    id: item.id,
    disciplina: item.disciplina,
    turma: item.turma,
    serie: item.serie,
    turno: item.turno,
    anoLetivo: null,
    detalhe: item.professorNome,
  }));
}

export async function getDiarioPendenciasEscola(
  supabase: SupabaseClient<Database>,
  escolaId: string,
  dataReferencia?: string,
): Promise<DiarioPendenciaEscola[]> {
  const data = dataReferencia ?? new Date().toISOString().slice(0, 10);
  const turmaIds = await getEscolaTurmaIds(supabase, escolaId);

  if (turmaIds.length === 0) {
    return [];
  }

  const { data: atribuicoesRaw } = await supabase
    .from("atribuicoes_docentes")
    .select("id, professor_id, turma_id, disciplina_id, ano_letivo_id")
    .in("turma_id", turmaIds);

  if (!atribuicoesRaw?.length) {
    return [];
  }

  const atribuicaoIds = atribuicoesRaw.map((item) => item.id);
  const professorIds = [
    ...new Set(atribuicoesRaw.map((item) => item.professor_id)),
  ];
  const disciplinaIds = [
    ...new Set(atribuicoesRaw.map((item) => item.disciplina_id)),
  ];
  const anoLetivoIds = [
    ...new Set(atribuicoesRaw.map((item) => item.ano_letivo_id)),
  ];

  const [
    { data: chamadas },
    { data: conteudos },
    { data: professores },
    { data: turmas },
    { data: disciplinas },
    { data: anosLetivos },
  ] = await Promise.all([
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
    supabase.from("profiles").select("id, nome").in("id", professorIds),
    supabase
      .from("turmas")
      .select("id, nome, serie, turno")
      .in("id", turmaIds),
    supabase.from("disciplinas").select("id, nome").in("id", disciplinaIds),
    supabase
      .from("anos_letivos")
      .select("id, ativo")
      .in("id", anoLetivoIds),
  ]);

  const chamadasSet = new Set(chamadas?.map((item) => item.atribuicao_id) ?? []);
  const conteudosSet = new Set(
    conteudos?.map((item) => item.atribuicao_id) ?? [],
  );
  const anosAtivos = new Set(
    (anosLetivos ?? []).filter((ano) => ano.ativo).map((ano) => ano.id),
  );

  const pendencias: DiarioPendenciaEscola[] = [];

  for (const atribuicao of atribuicoesRaw) {
    if (!anosAtivos.has(atribuicao.ano_letivo_id)) {
      continue;
    }

    const professor = professores?.find((p) => p.id === atribuicao.professor_id);
    const turma = turmas?.find((t) => t.id === atribuicao.turma_id);
    const disciplina = disciplinas?.find(
      (d) => d.id === atribuicao.disciplina_id,
    );

    let diaLetivo = false;
    try {
      diaLetivo = await validateDiaLetivo(data, atribuicao.ano_letivo_id);
    } catch {
      diaLetivo = isDevProfileId(atribuicao.professor_id);
    }

    const chamadaRegistrada = chamadasSet.has(atribuicao.id);
    const conteudoRegistrado = conteudosSet.has(atribuicao.id);
    const pendente = diaLetivo && (!chamadaRegistrada || !conteudoRegistrado);

    pendencias.push({
      atribuicaoId: atribuicao.id,
      professorId: atribuicao.professor_id,
      professorNome: professor?.nome ?? "Professor",
      disciplina: disciplina?.nome ?? "Disciplina",
      turma: turma?.nome ?? "Turma",
      serie: turma?.serie ?? "—",
      turno: turma?.turno ?? "—",
      data,
      diaLetivo,
      chamadaRegistrada,
      conteudoRegistrado,
      pendente,
    });
  }

  return pendencias.sort((a, b) => {
    if (a.pendente !== b.pendente) return a.pendente ? -1 : 1;
    return a.professorNome.localeCompare(b.professorNome, "pt-BR");
  });
}

export async function getEscolaResumo(
  supabase: SupabaseClient<Database>,
  escolaId: string,
): Promise<EscolaResumo> {
  const turmaIds = await getEscolaTurmaIds(supabase, escolaId);
  const hoje = new Date().toISOString().slice(0, 10);

  const [
    { count: professores },
    { data: matriculas },
    pendencias,
    atribuicoes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("escola_id", escolaId)
      .eq("role", "professor")
      .eq("ativo", true),
    turmaIds.length
      ? supabase
          .from("matriculas")
          .select("aluno_id")
          .in("turma_id", turmaIds)
          .eq("status", "ativa")
      : Promise.resolve({ data: [] as Array<{ aluno_id: string }> }),
    getDiarioPendenciasEscola(supabase, escolaId, hoje),
    getEscolaAtribuicoes(supabase, escolaId),
  ]);

  const alunosUnicos = new Set(
    matriculas?.map((matricula) => matricula.aluno_id) ?? [],
  );

  return {
    alunosMatriculados: alunosUnicos.size,
    professores: professores ?? 0,
    turmas: turmaIds.length,
    atribuicoes: atribuicoes.length,
    pendenciasHoje: pendencias.filter((item) => item.pendente).length,
  };
}

function calcularPercentual(presentes: number, total: number) {
  if (total === 0) return 0;
  return Math.round((presentes / total) * 1000) / 10;
}

export async function getEscolaBimestreOptions(
  supabase: SupabaseClient<Database>,
  escolaId: string,
) {
  const turmaIds = await getEscolaTurmaIds(supabase, escolaId);
  if (turmaIds.length === 0) return [];

  const { data: turmas } = await supabase
    .from("turmas")
    .select("ano_letivo_id")
    .in("id", turmaIds);

  const anoIds = [
    ...new Set(turmas?.map((turma) => turma.ano_letivo_id) ?? []),
  ];

  if (anoIds.length === 0) return [];

  const { data: anosAtivos } = await supabase
    .from("anos_letivos")
    .select("id")
    .in("id", anoIds)
    .eq("ativo", true);

  const anoAtivos = anosAtivos?.map((ano) => ano.id) ?? [];
  if (anoAtivos.length === 0) return [];

  const { data: bimestres } = await supabase
    .from("bimestres")
    .select("id, numero")
    .in("ano_letivo_id", anoAtivos)
    .order("numero");

  return (bimestres ?? []).map((item) => ({
    id: item.id,
    label: `${item.numero}º bimestre`,
  }));
}

export async function getFrequenciaConsolidadaEscola(
  escolaId: string,
  bimestreId?: string,
  escopo: "bimestre" | "anual" = "bimestre",
): Promise<FrequenciaTurmaResumo[]> {
  const supabase = await createClient();
  const turmaIds = await getEscolaTurmaIds(supabase, escolaId);

  if (turmaIds.length === 0) return [];

  const { data: atribuicoesRaw } = await supabase
    .from("atribuicoes_docentes")
    .select("id, turma_id, disciplina_id, ano_letivo_id")
    .in("turma_id", turmaIds);

  if (!atribuicoesRaw?.length) return [];

  const [{ data: turmas }, { data: disciplinas }, { data: anos }] =
    await Promise.all([
      supabase
        .from("turmas")
        .select("id, nome, serie, turno, escola_id")
        .in("id", turmaIds),
      supabase.from("disciplinas").select("id, nome"),
      supabase.from("anos_letivos").select("id, ano, ativo"),
    ]);

  const atribuicoes = atribuicoesRaw
    .map((row) => ({
      id: row.id,
      turma_id: row.turma_id,
      ano_letivo_id: row.ano_letivo_id,
      disciplina_id: row.disciplina_id,
      turmas: turmas?.find((turma) => turma.id === row.turma_id) ?? null,
      disciplinas:
        disciplinas?.find((disciplina) => disciplina.id === row.disciplina_id) ??
        null,
      anos_letivos:
        anos?.find((ano) => ano.id === row.ano_letivo_id) ?? null,
    }))
    .filter((item) => item.anos_letivos?.ativo);

  const resumos: FrequenciaTurmaResumo[] = [];

  for (const atribuicao of atribuicoes) {
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

  return resumos.sort((a, b) =>
    `${a.disciplina}${a.turma}`.localeCompare(
      `${b.disciplina}${b.turma}`,
      "pt-BR",
    ),
  );
}

export async function getEvasaoEscola(escolaId: string): Promise<AlunoEvasao[]> {
  try {
    const alunos = await getAlunosEvasao(500);
    return alunos.filter((aluno) => aluno.escola_id === escolaId);
  } catch {
    return [];
  }
}

export function agruparEvasaoEscolaPorTurma(alunos: AlunoEvasao[]) {
  const map = new Map<string, { turma: string; total: number }>();

  for (const aluno of alunos) {
    const key = `${aluno.turma_nome}|${aluno.serie}`;
    const atual = map.get(key) ?? { turma: `${aluno.turma_nome} (${aluno.serie})`, total: 0 };
    atual.total += 1;
    map.set(key, atual);
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}
