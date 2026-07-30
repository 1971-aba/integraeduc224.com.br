import { listServidoresEscola } from "@/actions/gestor-servidores";
import { requireRole } from "@/lib/auth";
import type {
  FormacaoProfessor,
  ProfessorEscola,
} from "@/lib/professor-formacao-config";
import { createClient } from "@/lib/supabase/server";

export type ContextoProfessoresEscola = {
  escolaNome: string;
  professores: ProfessorEscola[];
};

export async function getProfessoresEscola(
  filters?: { q?: string; status?: "ativo" | "inativo" },
): Promise<ContextoProfessoresEscola | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) return null;

  const supabase = await createClient();

  const [{ data: escola }, servidores] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    listServidoresEscola(profile.escola_id, {
      q: filters?.q,
      perfil: "professor",
      status: filters?.status,
    }),
  ]);

  const professorIds = servidores.map((item) => item.id);

  const [{ data: atribuicoes }, { data: formacoes }] = await Promise.all([
    professorIds.length
      ? supabase
          .from("atribuicoes_docentes")
          .select("professor_id")
          .in("professor_id", professorIds)
      : Promise.resolve({ data: [] }),
    professorIds.length
      ? supabase
          .from("professor_formacao")
          .select("professor_id")
          .in("professor_id", professorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const vinculosPorProfessor = new Map<string, number>();
  for (const item of atribuicoes ?? []) {
    vinculosPorProfessor.set(
      item.professor_id,
      (vinculosPorProfessor.get(item.professor_id) ?? 0) + 1,
    );
  }

  const formacoesPorProfessor = new Map<string, number>();
  for (const item of formacoes ?? []) {
    formacoesPorProfessor.set(
      item.professor_id,
      (formacoesPorProfessor.get(item.professor_id) ?? 0) + 1,
    );
  }

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    professores: servidores.map((professor) => ({
      id: professor.id,
      nome: professor.nome,
      email: professor.email,
      cpf: professor.cpf,
      ativo: professor.ativo,
      vinculos: vinculosPorProfessor.get(professor.id) ?? 0,
      formacoes: formacoesPorProfessor.get(professor.id) ?? 0,
    })),
  };
}

export async function getContextoFormacao(): Promise<{
  escolaNome: string;
  professores: Array<{ id: string; nome: string }>;
  formacoes: FormacaoProfessor[];
} | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) return null;

  const supabase = await createClient();

  const [{ data: escola }, { data: professores }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, nome")
      .eq("escola_id", profile.escola_id)
      .eq("role", "professor")
      .eq("ativo", true)
      .order("nome"),
  ]);

  const professorIds = professores?.map((item) => item.id) ?? [];

  const { data: formacoes } = professorIds.length
    ? await supabase
        .from("professor_formacao")
        .select(
          "id, professor_id, titulo, instituicao, tipo, carga_horaria, ano_conclusao",
        )
        .in("professor_id", professorIds)
        .order("ano_conclusao", { ascending: false })
    : { data: [] };

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    professores: professores ?? [],
    formacoes: (formacoes ?? []).map((item) => ({
      id: item.id,
      professorId: item.professor_id,
      titulo: item.titulo,
      instituicao: item.instituicao,
      tipo: item.tipo,
      cargaHoraria: item.carga_horaria,
      anoConclusao: item.ano_conclusao,
    })),
  };
}
