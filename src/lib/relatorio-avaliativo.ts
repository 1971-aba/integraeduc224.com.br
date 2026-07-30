import { getBoletimTurma, getTurmasBoletimEscola } from "@/lib/boletim";
import { calcularMediaAnual } from "@/lib/diario-utils";
import { createClient } from "@/lib/supabase/server";
import { formatTurnoLabel } from "@/lib/dashboard-utils";

export type TurmaAvaliativaResumo = {
  turmaId: string;
  turmaNome: string;
  serie: string;
  turno: string;
  totalAlunos: number;
  mediaTurma: number | null;
  aprovados: number;
  reprovados: number;
  semNota: number;
};

export type DisciplinaAvaliativaResumo = {
  disciplina: string;
  mediaDisciplina: number | null;
  turmasComNota: number;
};

export type RelatorioAvaliativoEscola = {
  bimestres: Array<{ id: string; numero: number }>;
  turmas: TurmaAvaliativaResumo[];
  disciplinas: DisciplinaAvaliativaResumo[];
  totais: {
    alunos: number;
    mediaGeral: number | null;
    aprovados: number;
    reprovados: number;
  };
};

export async function getRelatorioAvaliativoEscola(
  escolaId: string,
  bimestreId?: string,
): Promise<RelatorioAvaliativoEscola> {
  const turmasOpcoes = await getTurmasBoletimEscola(escolaId);
  const turmasResumo: TurmaAvaliativaResumo[] = [];
  const disciplinaMap = new Map<
    string,
    { soma: number; count: number; turmas: Set<string> }
  >();

  let bimestres: Array<{ id: string; numero: number }> = [];
  let totalAlunos = 0;
  let totalAprovados = 0;
  let totalReprovados = 0;
  const mediasGeraisEscola: Array<number | null> = [];

  for (const turmaOpt of turmasOpcoes) {
    const boletim = await getBoletimTurma(escolaId, turmaOpt.id, bimestreId);
    if (!boletim) continue;

    if (bimestres.length === 0) {
      bimestres = boletim.bimestres;
    }

    const mediasAlunos = boletim.alunos.map((a) => a.mediaGeral);
    const mediaTurma = calcularMediaAnual(mediasAlunos);
    const aprovados = boletim.alunos.filter(
      (a) => a.mediaGeral !== null && a.mediaGeral >= 6,
    ).length;
    const reprovados = boletim.alunos.filter(
      (a) => a.mediaGeral !== null && a.mediaGeral < 6,
    ).length;
    const semNota = boletim.alunos.filter((a) => a.mediaGeral === null).length;

    turmasResumo.push({
      turmaId: boletim.turma.id,
      turmaNome: boletim.turma.nome,
      serie: boletim.turma.serie,
      turno: formatTurnoLabel(boletim.turma.turno),
      totalAlunos: boletim.alunos.length,
      mediaTurma,
      aprovados,
      reprovados,
      semNota,
    });

    totalAlunos += boletim.alunos.length;
    totalAprovados += aprovados;
    totalReprovados += reprovados;
    mediasGeraisEscola.push(...mediasAlunos);

    for (const disciplina of boletim.disciplinas) {
      const mediasDisc = boletim.alunos
        .map((a) => a.mediasPorDisciplina[disciplina.atribuicaoId] ?? null)
        .filter((m): m is number => m !== null);

      if (mediasDisc.length === 0) continue;

      const mediaDisc = calcularMediaAnual(mediasDisc);
      if (mediaDisc === null) continue;

      const atual = disciplinaMap.get(disciplina.disciplina) ?? {
        soma: 0,
        count: 0,
        turmas: new Set<string>(),
      };
      atual.soma += mediaDisc;
      atual.count += 1;
      atual.turmas.add(boletim.turma.id);
      disciplinaMap.set(disciplina.disciplina, atual);
    }
  }

  const disciplinas: DisciplinaAvaliativaResumo[] = Array.from(
    disciplinaMap.entries(),
  )
    .map(([disciplina, stats]) => ({
      disciplina,
      mediaDisciplina:
        stats.count > 0
          ? Math.round((stats.soma / stats.count) * 100) / 100
          : null,
      turmasComNota: stats.turmas.size,
    }))
    .sort((a, b) => a.disciplina.localeCompare(b.disciplina, "pt-BR"));

  return {
    bimestres,
    turmas: turmasResumo.sort((a, b) =>
      `${a.serie}${a.turmaNome}`.localeCompare(
        `${b.serie}${b.turmaNome}`,
        "pt-BR",
      ),
    ),
    disciplinas,
    totais: {
      alunos: totalAlunos,
      mediaGeral: calcularMediaAnual(mediasGeraisEscola),
      aprovados: totalAprovados,
      reprovados: totalReprovados,
    },
  };
}

export async function getBimestresEscolaAtiva(escolaId: string) {
  const supabase = await createClient();

  const { data: turmas } = await supabase
    .from("turmas")
    .select("ano_letivo_id")
    .eq("escola_id", escolaId);

  const anoIds = [...new Set(turmas?.map((t) => t.ano_letivo_id) ?? [])];
  if (anoIds.length === 0) return [];

  const { data: anosAtivos } = await supabase
    .from("anos_letivos")
    .select("id")
    .in("id", anoIds)
    .eq("ativo", true);

  const anoAtivos = anosAtivos?.map((a) => a.id) ?? [];
  if (anoAtivos.length === 0) return [];

  const { data: bimestres } = await supabase
    .from("bimestres")
    .select("id, numero")
    .in("ano_letivo_id", anoAtivos)
    .order("numero");

  return bimestres ?? [];
}
