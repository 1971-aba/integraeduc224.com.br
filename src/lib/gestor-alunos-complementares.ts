import { requireRole } from "@/lib/auth";
import {
  BUCKET_FOTOS_ALUNOS,
  type AlunoComplementar,
} from "@/lib/alunos-complementares-config";
import { createClient } from "@/lib/supabase/server";

export type ContextoComplementares = {
  escolaId: string;
  escolaNome: string;
  alunos: AlunoComplementar[];
};

/** O bucket é privado, então cada foto é exposta por uma URL assinada. */
const VALIDADE_URL_SEGUNDOS = 60 * 60;

export async function getContextoComplementares(): Promise<ContextoComplementares | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) return null;

  const supabase = await createClient();

  const [{ data: escola }, { data: turmas }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("turmas")
      .select("id, nome, serie")
      .eq("escola_id", profile.escola_id),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id, turma_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const turmaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula.turma_id]) ??
      [],
  );
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);
  const alunoIds = [...turmaPorAluno.keys()];

  const [{ data: alunos }, { data: complementares }] = await Promise.all([
    alunoIds.length
      ? supabase
          .from("alunos")
          .select("id, nome, data_nascimento")
          .in("id", alunoIds)
          .order("nome")
      : Promise.resolve({ data: [] }),
    alunoIds.length
      ? supabase
          .from("alunos_complementares")
          .select("aluno_id, cor_raca, etnia_indigena, foto_path")
          .in("aluno_id", alunoIds)
      : Promise.resolve({ data: [] }),
  ]);

  const complementarPorAluno = new Map(
    complementares?.map((item) => [item.aluno_id, item]) ?? [],
  );

  const caminhos = (complementares ?? [])
    .map((item) => item.foto_path)
    .filter((path): path is string => Boolean(path));

  const urlPorCaminho = new Map<string, string>();

  if (caminhos.length > 0) {
    const { data: assinadas } = await supabase.storage
      .from(BUCKET_FOTOS_ALUNOS)
      .createSignedUrls(caminhos, VALIDADE_URL_SEGUNDOS);

    for (const assinada of assinadas ?? []) {
      if (assinada.path && assinada.signedUrl) {
        urlPorCaminho.set(assinada.path, assinada.signedUrl);
      }
    }
  }

  return {
    escolaId: profile.escola_id,
    escolaNome: escola?.nome ?? "Unidade Escolar",
    alunos: (alunos ?? []).map((aluno) => {
      const turma = turmaPorId.get(turmaPorAluno.get(aluno.id) ?? "");
      const complementar = complementarPorAluno.get(aluno.id);

      return {
        id: aluno.id,
        nome: aluno.nome,
        turma: turma ? `${turma.nome} (${turma.serie})` : "Sem turma",
        dataNascimento: aluno.data_nascimento,
        corRaca: complementar?.cor_raca ?? null,
        etniaIndigena: complementar?.etnia_indigena ?? null,
        fotoUrl: complementar?.foto_path
          ? urlPorCaminho.get(complementar.foto_path) ?? null
          : null,
      };
    }),
  };
}

/** Fotos dos alunos informados, para uso nas carteirinhas. */
export async function getFotosPorAluno(
  alunoIds: string[],
): Promise<Map<string, string>> {
  if (alunoIds.length === 0) return new Map();

  const supabase = await createClient();

  const { data: complementares } = await supabase
    .from("alunos_complementares")
    .select("aluno_id, foto_path")
    .in("aluno_id", alunoIds)
    .not("foto_path", "is", null);

  const caminhos = (complementares ?? [])
    .map((item) => item.foto_path)
    .filter((path): path is string => Boolean(path));

  if (caminhos.length === 0) return new Map();

  const { data: assinadas } = await supabase.storage
    .from(BUCKET_FOTOS_ALUNOS)
    .createSignedUrls(caminhos, VALIDADE_URL_SEGUNDOS);

  const urlPorCaminho = new Map(
    (assinadas ?? [])
      .filter((item) => item.path && item.signedUrl)
      .map((item) => [item.path as string, item.signedUrl]),
  );

  const resultado = new Map<string, string>();

  for (const complementar of complementares ?? []) {
    const url = complementar.foto_path
      ? urlPorCaminho.get(complementar.foto_path)
      : undefined;
    if (url) resultado.set(complementar.aluno_id, url);
  }

  return resultado;
}
