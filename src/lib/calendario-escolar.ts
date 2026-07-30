import { createClient } from "@/lib/supabase/server";

export type CalendarioBimestre = {
  numero: number;
  dataInicio: string;
  dataFim: string;
};

export type CalendarioEvento = {
  titulo: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
};

export type CalendarioEscolarData = {
  ano: number;
  anoLetivoId: string;
  bimestres: CalendarioBimestre[];
  eventos: CalendarioEvento[];
};

export async function getCalendarioEscolar(
  secretariaId: string,
): Promise<CalendarioEscolarData | null> {
  const supabase = await createClient();

  const { data: anoAtivo } = await supabase
    .from("anos_letivos")
    .select("id, ano")
    .eq("secretaria_id", secretariaId)
    .eq("ativo", true)
    .maybeSingle();

  if (!anoAtivo) {
    return null;
  }

  const [{ data: bimestres }, { data: eventos }] = await Promise.all([
    supabase
      .from("bimestres")
      .select("numero, data_inicio, data_fim")
      .eq("ano_letivo_id", anoAtivo.id)
      .order("numero"),
    supabase
      .from("calendario_eventos")
      .select("titulo, tipo, data_inicio, data_fim")
      .eq("ano_letivo_id", anoAtivo.id)
      .order("data_inicio"),
  ]);

  return {
    ano: anoAtivo.ano,
    anoLetivoId: anoAtivo.id,
    bimestres:
      bimestres?.map((item) => ({
        numero: item.numero,
        dataInicio: item.data_inicio,
        dataFim: item.data_fim,
      })) ?? [],
    eventos:
      eventos?.map((item) => ({
        titulo: item.titulo,
        tipo: item.tipo,
        dataInicio: item.data_inicio,
        dataFim: item.data_fim,
      })) ?? [],
  };
}

export async function getSecretariaIdFromEscola(escolaId: string) {
  const supabase = await createClient();
  const { data: escola } = await supabase
    .from("escolas")
    .select("secretaria_id")
    .eq("id", escolaId)
    .maybeSingle();

  return escola?.secretaria_id ?? null;
}
