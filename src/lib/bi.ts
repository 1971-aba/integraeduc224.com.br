import { createClient } from "@/lib/supabase/server";
import type { AlunoEvasao, BiFilters, DesempenhoItem } from "@/lib/bi-types";

export async function getAlunosEvasao(limite = 25) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("bi_alunos_evasao", {
    p_limite: limite,
  });

  if (error) throw error;
  return (data ?? []) as AlunoEvasao[];
}

export async function getDesempenhoRede(filters: BiFilters = {}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("bi_desempenho_rede", {
    p_escola_id: filters.escolaId || null,
    p_serie: filters.serie || null,
    p_disciplina_id: filters.disciplinaId || null,
    p_bimestre_id: filters.bimestreId || null,
  });

  if (error) throw error;
  return (data ?? []) as DesempenhoItem[];
}

export async function getBiFilterOptions() {
  const supabase = await createClient();

  const [{ data: escolas }, { data: disciplinas }, { data: anoAtivo }] =
    await Promise.all([
      supabase.from("escolas").select("id, nome").eq("ativa", true).order("nome"),
      supabase.from("disciplinas").select("id, nome").order("nome"),
      supabase.from("anos_letivos").select("id").eq("ativo", true).maybeSingle(),
    ]);

  const { data: bimestres } = anoAtivo
    ? await supabase
        .from("bimestres")
        .select("id, numero")
        .eq("ano_letivo_id", anoAtivo.id)
        .order("numero")
    : { data: [] as Array<{ id: string; numero: number }> };

  const series = [
    "1º ano do Ensino Fundamental",
    "2º ano do Ensino Fundamental",
    "3º ano do Ensino Fundamental",
    "4º ano do Ensino Fundamental",
    "5º ano do Ensino Fundamental",
    "6º ano do Ensino Fundamental",
    "7º ano do Ensino Fundamental",
    "8º ano do Ensino Fundamental",
    "9º ano do Ensino Fundamental",
  ];

  return {
    escolas: escolas ?? [],
    disciplinas: disciplinas ?? [],
    series,
    bimestres: (bimestres ?? []).map((item) => ({
      id: item.id,
      label: `${item.numero}º bimestre`,
    })),
  };
}

export function agruparEvasaoPorEscola(alunos: AlunoEvasao[]) {
  const map = new Map<string, { escola: string; total: number }>();

  for (const aluno of alunos) {
    const atual = map.get(aluno.escola_id) ?? {
      escola: aluno.escola_nome,
      total: 0,
    };
    atual.total += 1;
    map.set(aluno.escola_id, atual);
  }

  return Array.from(map.values())
    .map((item) => ({ escola: item.escola, alunos: item.total }))
    .sort((a, b) => b.alunos - a.alunos);
}

export function agruparMediaPorEscola(itens: DesempenhoItem[]) {
  const map = new Map<string, { escola: string; soma: number; count: number }>();

  for (const item of itens) {
    const atual = map.get(item.escola_id) ?? {
      escola: item.escola_nome,
      soma: 0,
      count: 0,
    };
    atual.soma += item.media;
    atual.count += 1;
    map.set(item.escola_id, atual);
  }

  return Array.from(map.values())
    .map((item) => ({
      escola: item.escola,
      media: Math.round((item.soma / item.count) * 100) / 100,
    }))
    .sort((a, b) => b.media - a.media);
}

export function agruparMediaPorDisciplina(itens: DesempenhoItem[]) {
  const map = new Map<string, { disciplina: string; soma: number; count: number }>();

  for (const item of itens) {
    const atual = map.get(item.disciplina_id) ?? {
      disciplina: item.disciplina_nome,
      soma: 0,
      count: 0,
    };
    atual.soma += item.media;
    atual.count += 1;
    map.set(item.disciplina_id, atual);
  }

  return Array.from(map.values())
    .map((item) => ({
      disciplina: item.disciplina,
      media: Math.round((item.soma / item.count) * 100) / 100,
    }))
    .sort((a, b) => b.media - a.media);
}
