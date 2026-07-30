import { createClient } from "@/lib/supabase/server";
import { calcularMediaAnual } from "@/lib/diario-utils";
import { getBimestres, getMatriculasAtivas } from "@/lib/diario";

export type BoletimTurmaOption = {
  id: string;
  label: string;
  serie: string;
};

export type BoletimDisciplinaColuna = {
  atribuicaoId: string;
  disciplina: string;
  professor: string;
};

export type BoletimAlunoLinha = {
  matriculaId: string;
  nome: string;
  mediasPorDisciplina: Record<string, number | null>;
  mediaGeral: number | null;
};

export type BoletimTurmaData = {
  turma: {
    id: string;
    nome: string;
    serie: string;
    turno: string;
    anoLetivoId: string;
  };
  bimestres: Array<{ id: string; numero: number }>;
  disciplinas: BoletimDisciplinaColuna[];
  alunos: BoletimAlunoLinha[];
};

export async function getTurmasBoletimEscola(
  escolaId: string,
): Promise<BoletimTurmaOption[]> {
  const supabase = await createClient();

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, serie, turno")
    .eq("escola_id", escolaId)
    .order("serie")
    .order("nome");

  return (
    turmas?.map((turma) => ({
      id: turma.id,
      label: `${turma.nome} — ${turma.serie} (${turma.turno})`,
      serie: turma.serie,
    })) ?? []
  );
}

export async function getBoletimTurma(
  escolaId: string,
  turmaId: string,
  bimestreId?: string,
): Promise<BoletimTurmaData | null> {
  const supabase = await createClient();

  const { data: turma } = await supabase
    .from("turmas")
    .select("id, nome, serie, turno, ano_letivo_id, escola_id")
    .eq("id", turmaId)
    .maybeSingle();

  if (!turma || turma.escola_id !== escolaId) {
    return null;
  }

  const [matriculas, bimestres, atribuicoesRaw] = await Promise.all([
    getMatriculasAtivas(turmaId),
    getBimestres(turma.ano_letivo_id),
    supabase
      .from("atribuicoes_docentes")
      .select("id, disciplina_id, professor_id")
      .eq("turma_id", turmaId)
      .order("created_at"),
  ]);

  if (!atribuicoesRaw.data?.length) {
    return {
      turma: {
        id: turma.id,
        nome: turma.nome,
        serie: turma.serie,
        turno: turma.turno,
        anoLetivoId: turma.ano_letivo_id,
      },
      bimestres: bimestres.map((b) => ({ id: b.id, numero: b.numero })),
      disciplinas: [],
      alunos: matriculas.map((m) => ({
        matriculaId: m.id,
        nome: m.alunos?.nome ?? "Aluno",
        mediasPorDisciplina: {},
        mediaGeral: null,
      })),
    };
  }

  const disciplinaIds = [
    ...new Set(atribuicoesRaw.data.map((a) => a.disciplina_id)),
  ];
  const professorIds = [
    ...new Set(atribuicoesRaw.data.map((a) => a.professor_id)),
  ];
  const atribuicaoIds = atribuicoesRaw.data.map((a) => a.id);

  const [{ data: disciplinasDb }, { data: professores }] = await Promise.all([
    supabase.from("disciplinas").select("id, nome").in("id", disciplinaIds),
    supabase.from("profiles").select("id, nome").in("id", professorIds),
  ]);

  const disciplinas: BoletimDisciplinaColuna[] = atribuicoesRaw.data.map(
    (item) => ({
      atribuicaoId: item.id,
      disciplina:
        disciplinasDb?.find((d) => d.id === item.disciplina_id)?.nome ??
        "Disciplina",
      professor:
        professores?.find((p) => p.id === item.professor_id)?.nome ??
        "Professor",
    }),
  );

  const { data: notasSalvas } = await supabase
    .from("notas")
    .select("atribuicao_id, matricula_id, bimestre_id, media_bimestre, nota, recuperacao")
    .in("atribuicao_id", atribuicaoIds);

  const bimestreAlvo = bimestreId ?? bimestres[bimestres.length - 1]?.id;

  const alunos: BoletimAlunoLinha[] = matriculas.map((matricula) => {
    const mediasPorDisciplina: Record<string, number | null> = {};
    const mediasGerais: Array<number | null> = [];

    for (const coluna of disciplinas) {
      let media: number | null = null;

      if (bimestreAlvo) {
        const registro = notasSalvas?.find(
          (n) =>
            n.atribuicao_id === coluna.atribuicaoId &&
            n.matricula_id === matricula.id &&
            n.bimestre_id === bimestreAlvo,
        );
        media =
          registro?.media_bimestre ??
          (registro?.nota != null || registro?.recuperacao != null
            ? Math.max(registro?.nota ?? 0, registro?.recuperacao ?? 0)
            : null);
      } else {
        const mediasBim = bimestres.map((bimestre) => {
          const registro = notasSalvas?.find(
            (n) =>
              n.atribuicao_id === coluna.atribuicaoId &&
              n.matricula_id === matricula.id &&
              n.bimestre_id === bimestre.id,
          );
          return registro?.media_bimestre ?? null;
        });
        media = calcularMediaAnual(mediasBim);
      }

      mediasPorDisciplina[coluna.atribuicaoId] = media;
      mediasGerais.push(media);
    }

    return {
      matriculaId: matricula.id,
      nome: matricula.alunos?.nome ?? "Aluno",
      mediasPorDisciplina,
      mediaGeral: calcularMediaAnual(mediasGerais),
    };
  });

  alunos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return {
    turma: {
      id: turma.id,
      nome: turma.nome,
      serie: turma.serie,
      turno: turma.turno,
      anoLetivoId: turma.ano_letivo_id,
    },
    bimestres: bimestres.map((b) => ({ id: b.id, numero: b.numero })),
    disciplinas,
    alunos,
  };
}
