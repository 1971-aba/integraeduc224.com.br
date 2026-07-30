import { createClient } from "@/lib/supabase/server";
import { calcularMediaAnual } from "@/lib/diario-utils";
import { getBimestres } from "@/lib/diario";
import { formatTurnoLabel } from "@/lib/dashboard-utils";

export type HistoricoMatricula = {
  id: string;
  status: string;
  dataMatricula: string;
  turmaNome: string;
  serie: string;
  turno: string;
  anoLetivo: number | null;
  escolaNome: string;
};

export type HistoricoNotaDisciplina = {
  disciplina: string;
  professor: string;
  mediasPorBimestre: Record<number, number | null>;
  mediaAnual: number | null;
};

export type HistoricoEscolarData = {
  aluno: {
    id: string;
    nome: string;
    cpf: string | null;
    dataNascimento: string | null;
    nomeMae: string | null;
  };
  matriculas: HistoricoMatricula[];
  notasAtuais: HistoricoNotaDisciplina[];
  bimestres: Array<{ id: string; numero: number }>;
  matriculaAtivaId: string | null;
};

export async function getHistoricoEscolar(
  alunoId: string,
  secretariaId: string,
): Promise<HistoricoEscolarData | null> {
  const supabase = await createClient();

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, nome, cpf, data_nascimento, nome_mae, secretaria_id")
    .eq("id", alunoId)
    .maybeSingle();

  if (!aluno || aluno.secretaria_id !== secretariaId) {
    return null;
  }

  const { data: matriculasRaw } = await supabase
    .from("matriculas")
    .select("id, status, data_matricula, turma_id, ano_letivo_id")
    .eq("aluno_id", alunoId)
    .order("data_matricula", { ascending: false });

  if (!matriculasRaw?.length) {
    return {
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        cpf: aluno.cpf,
        dataNascimento: aluno.data_nascimento,
        nomeMae: aluno.nome_mae,
      },
      matriculas: [],
      notasAtuais: [],
      bimestres: [],
      matriculaAtivaId: null,
    };
  }

  const turmaIds = [...new Set(matriculasRaw.map((m) => m.turma_id))];
  const anoIds = [...new Set(matriculasRaw.map((m) => m.ano_letivo_id))];

  const [{ data: turmas }, { data: anos }] = await Promise.all([
    supabase
      .from("turmas")
      .select("id, nome, serie, turno, escola_id")
      .in("id", turmaIds),
    supabase.from("anos_letivos").select("id, ano").in("id", anoIds),
  ]);

  const escolaIds = [...new Set(turmas?.map((t) => t.escola_id) ?? [])];
  const { data: escolas } = escolaIds.length
    ? await supabase.from("escolas").select("id, nome").in("id", escolaIds)
    : { data: [] };

  const matriculas: HistoricoMatricula[] = matriculasRaw.map((matricula) => {
    const turma = turmas?.find((t) => t.id === matricula.turma_id);
    const ano = anos?.find((a) => a.id === matricula.ano_letivo_id);
    const escola = escolas?.find((e) => e.id === turma?.escola_id);

    return {
      id: matricula.id,
      status: matricula.status,
      dataMatricula: matricula.data_matricula,
      turmaNome: turma?.nome ?? "—",
      serie: turma?.serie ?? "—",
      turno: turma?.turno ? formatTurnoLabel(turma.turno) : "—",
      anoLetivo: ano?.ano ?? null,
      escolaNome: escola?.nome ?? "—",
    };
  });

  const matriculaAtiva =
    matriculasRaw.find((m) => m.status === "ativa") ?? matriculasRaw[0];

  let notasAtuais: HistoricoNotaDisciplina[] = [];
  let bimestres: Array<{ id: string; numero: number }> = [];

  if (matriculaAtiva) {
    const turma = turmas?.find((t) => t.id === matriculaAtiva.turma_id);
    if (turma) {
      const bimestresDb = await getBimestres(matriculaAtiva.ano_letivo_id);
      bimestres = bimestresDb.map((b) => ({ id: b.id, numero: b.numero }));

      const { data: atribuicoes } = await supabase
        .from("atribuicoes_docentes")
        .select("id, disciplina_id, professor_id")
        .eq("turma_id", turma.id);

      if (atribuicoes?.length) {
        const disciplinaIds = atribuicoes.map((a) => a.disciplina_id);
        const professorIds = atribuicoes.map((a) => a.professor_id);
        const atribuicaoIds = atribuicoes.map((a) => a.id);

        const [{ data: disciplinasDb }, { data: professores }, { data: notas }] =
          await Promise.all([
            supabase.from("disciplinas").select("id, nome").in("id", disciplinaIds),
            supabase.from("profiles").select("id, nome").in("id", professorIds),
            supabase
              .from("notas")
              .select(
                "atribuicao_id, bimestre_id, media_bimestre, nota, recuperacao",
              )
              .eq("matricula_id", matriculaAtiva.id)
              .in("atribuicao_id", atribuicaoIds),
          ]);

        notasAtuais = atribuicoes.map((atribuicao) => {
          const mediasPorBimestre: Record<number, number | null> = {};
          const mediasLista: Array<number | null> = [];

          for (const bimestre of bimestresDb) {
            const registro = notas?.find(
              (n) =>
                n.atribuicao_id === atribuicao.id &&
                n.bimestre_id === bimestre.id,
            );
            const media =
              registro?.media_bimestre ??
              (registro?.nota != null || registro?.recuperacao != null
                ? Math.max(registro?.nota ?? 0, registro?.recuperacao ?? 0)
                : null);
            mediasPorBimestre[bimestre.numero] = media;
            mediasLista.push(media);
          }

          return {
            disciplina:
              disciplinasDb?.find((d) => d.id === atribuicao.disciplina_id)
                ?.nome ?? "Disciplina",
            professor:
              professores?.find((p) => p.id === atribuicao.professor_id)?.nome ??
              "Professor",
            mediasPorBimestre,
            mediaAnual: calcularMediaAnual(mediasLista),
          };
        });
      }
    }
  }

  return {
    aluno: {
      id: aluno.id,
      nome: aluno.nome,
      cpf: aluno.cpf,
      dataNascimento: aluno.data_nascimento,
      nomeMae: aluno.nome_mae,
    },
    matriculas,
    notasAtuais,
    bimestres,
    matriculaAtivaId: matriculaAtiva?.id ?? null,
  };
}
