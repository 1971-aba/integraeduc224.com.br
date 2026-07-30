import type {
  FrequenciaAlunoResumo,
  FrequenciaTurmaResumo,
} from "@/lib/professor-diario";

export type FrequenciaAlunoLinha = FrequenciaAlunoResumo & {
  atribuicaoId: string;
  turma: string;
  serie: string;
  disciplina: string;
  periodoLabel: string;
};

export type FrequenciaTurmaAnualResumo = {
  turmaId: string;
  turma: string;
  serie: string;
  turno: string;
  totalAulas: number;
  totalAlunos: number;
  percentualPresenca: number;
  disciplinas: string[];
};

export type FrequenciaDisciplinaAnualResumo = {
  disciplinaId: string;
  disciplina: string;
  totalAulas: number;
  percentualPresenca: number;
  turmas: string[];
};

export function flattenFrequenciaAlunos(
  resumos: FrequenciaTurmaResumo[],
): FrequenciaAlunoLinha[] {
  const linhas: FrequenciaAlunoLinha[] = [];

  for (const turma of resumos) {
    for (const aluno of turma.alunos) {
      linhas.push({
        ...aluno,
        atribuicaoId: turma.atribuicaoId,
        turma: turma.turma,
        serie: turma.serie,
        disciplina: turma.disciplina,
        periodoLabel: turma.periodoLabel,
      });
    }
  }

  return linhas.sort((a, b) => {
    const nome = a.nome.localeCompare(b.nome, "pt-BR");
    if (nome !== 0) return nome;
    return a.disciplina.localeCompare(b.disciplina, "pt-BR");
  });
}

export function agruparFrequenciaPorTurmaAnual(
  resumos: FrequenciaTurmaResumo[],
): FrequenciaTurmaAnualResumo[] {
  const map = new Map<string, FrequenciaTurmaAnualResumo>();

  for (const item of resumos) {
    const atual = map.get(item.turmaId);
    const totalPresentes = item.alunos.reduce(
      (acc, aluno) => acc + aluno.presentes,
      0,
    );
    const totalPossivel =
      item.alunos.length * item.totalAulasRegistradas;

    if (!atual) {
      map.set(item.turmaId, {
        turmaId: item.turmaId,
        turma: item.turma,
        serie: item.serie,
        turno: item.turno,
        totalAulas: item.totalAulasRegistradas,
        totalAlunos: item.totalAlunos,
        percentualPresenca:
          totalPossivel > 0
            ? Math.round((totalPresentes / totalPossivel) * 1000) / 10
            : 0,
        disciplinas: [item.disciplina],
      });
      continue;
    }

    const novoPresentes =
      (atual.percentualPresenca / 100) *
        atual.totalAlunos *
        atual.totalAulas +
      totalPresentes;
    const novoPossivel =
      atual.totalAlunos * atual.totalAulas + totalPossivel;

    map.set(item.turmaId, {
      ...atual,
      totalAulas: Math.max(atual.totalAulas, item.totalAulasRegistradas),
      totalAlunos: Math.max(atual.totalAlunos, item.totalAlunos),
      percentualPresenca:
        novoPossivel > 0
          ? Math.round((novoPresentes / novoPossivel) * 1000) / 10
          : 0,
      disciplinas: [...new Set([...atual.disciplinas, item.disciplina])],
    });
  }

  return [...map.values()].sort((a, b) =>
    a.turma.localeCompare(b.turma, "pt-BR"),
  );
}

export function agruparFrequenciaPorDisciplinaAnual(
  resumos: FrequenciaTurmaResumo[],
): FrequenciaDisciplinaAnualResumo[] {
  const map = new Map<string, FrequenciaDisciplinaAnualResumo>();

  for (const item of resumos) {
    const totalPresentes = item.alunos.reduce(
      (acc, aluno) => acc + aluno.presentes,
      0,
    );
    const totalPossivel =
      item.alunos.length * item.totalAulasRegistradas;
    const percentual =
      totalPossivel > 0
        ? Math.round((totalPresentes / totalPossivel) * 1000) / 10
        : 0;

    const atual = map.get(item.disciplinaId);
    if (!atual) {
      map.set(item.disciplinaId, {
        disciplinaId: item.disciplinaId,
        disciplina: item.disciplina,
        totalAulas: item.totalAulasRegistradas,
        percentualPresenca: percentual,
        turmas: [item.turma],
      });
      continue;
    }

    const novoPresentes =
      (atual.percentualPresenca / 100) *
        atual.turmas.length *
        atual.totalAulas +
      totalPresentes;
    const novoPossivel =
      atual.turmas.length * atual.totalAulas + totalPossivel;

    map.set(item.disciplinaId, {
      ...atual,
      totalAulas: Math.max(atual.totalAulas, item.totalAulasRegistradas),
      percentualPresenca:
        novoPossivel > 0
          ? Math.round((novoPresentes / novoPossivel) * 1000) / 10
          : 0,
      turmas: [...new Set([...atual.turmas, item.turma])],
    });
  }

  return [...map.values()].sort((a, b) =>
    a.disciplina.localeCompare(b.disciplina, "pt-BR"),
  );
}

export function filtrarPorTexto<T extends Record<string, unknown>>(
  items: T[],
  query: string | undefined,
  fields: Array<keyof T>,
) {
  const termo = query?.trim().toLowerCase();
  if (!termo) return items;

  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(termo);
      }
      if (Array.isArray(value)) {
        return value.some(
          (entry) =>
            typeof entry === "string" && entry.toLowerCase().includes(termo),
        );
      }
      return false;
    }),
  );
}
