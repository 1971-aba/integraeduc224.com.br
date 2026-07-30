import { requireRole } from "@/lib/auth";
import type {
  EscolaInformacoes,
  LocalidadeEscola,
  RotaOnibus,
} from "@/lib/estrutura-outros-config";
import { createClient } from "@/lib/supabase/server";

export type ContextoEscolaEstrutura = {
  escola: {
    id: string;
    nome: string;
    inep: string | null;
    endereco: string | null;
  };
  secretariaNome: string;
  municipio: string;
  informacoes: EscolaInformacoes | null;
};

export async function getContextoEscolaEstrutura(): Promise<ContextoEscolaEstrutura | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  if (!profile.escola_id) return null;

  const supabase = await createClient();

  const [{ data: escola }, { data: informacoes }, { data: secretaria }] =
    await Promise.all([
      supabase
        .from("escolas")
        .select("id, nome, inep, endereco, secretaria_id")
        .eq("id", profile.escola_id)
        .maybeSingle(),
      supabase
        .from("escolas_informacoes")
        .select(
          "telefone, email, diretor_nome, vice_diretor_nome, secretario_nome, horario_funcionamento, observacoes",
        )
        .eq("escola_id", profile.escola_id)
        .maybeSingle(),
      profile.secretaria_id
        ? supabase
            .from("secretarias")
            .select("nome, municipio, uf")
            .eq("id", profile.secretaria_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (!escola) return null;

  return {
    escola: {
      id: escola.id,
      nome: escola.nome,
      inep: escola.inep,
      endereco: escola.endereco,
    },
    secretariaNome: secretaria?.nome ?? "Secretaria Municipal de Educação",
    municipio: secretaria
      ? `${secretaria.municipio}-${secretaria.uf}`
      : "Município",
    informacoes: informacoes
      ? {
          telefone: informacoes.telefone,
          email: informacoes.email,
          diretorNome: informacoes.diretor_nome,
          viceDiretorNome: informacoes.vice_diretor_nome,
          secretarioNome: informacoes.secretario_nome,
          horarioFuncionamento: informacoes.horario_funcionamento,
          observacoes: informacoes.observacoes,
        }
      : null,
  };
}

export async function getLocalidadesEscola(): Promise<{
  escolaNome: string;
  localidades: LocalidadeEscola[];
} | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  if (!profile.escola_id) return null;

  const supabase = await createClient();

  const [{ data: escola }, { data: localidades }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("escola_localidades")
      .select("id, nome, tipo, zona")
      .eq("escola_id", profile.escola_id)
      .order("nome"),
  ]);

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    localidades: (localidades ?? []).map((item) => ({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      zona: item.zona,
    })),
  };
}

export async function getRotasOnibus(): Promise<{
  escolaNome: string;
  rotas: RotaOnibus[];
} | null> {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  if (!profile.escola_id) return null;

  const supabase = await createClient();

  const [{ data: escola }, { data: rotas }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("rotas_onibus")
      .select("id, nome, turno, motorista, monitor, observacoes")
      .eq("escola_id", profile.escola_id)
      .order("nome"),
  ]);

  return {
    escolaNome: escola?.nome ?? "Unidade Escolar",
    rotas: (rotas ?? []).map((item) => ({
      id: item.id,
      nome: item.nome,
      turno: item.turno,
      motorista: item.motorista,
      monitor: item.monitor,
      observacoes: item.observacoes,
    })),
  };
}
