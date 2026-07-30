export type TipoLocalidade = "bairro" | "povoado";
export type ZonaLocalidade = "urbana" | "rural";

export const TIPO_LOCALIDADE_LABEL: Record<TipoLocalidade, string> = {
  bairro: "Bairro",
  povoado: "Povoado",
};

export const ZONA_LOCALIDADE_LABEL: Record<ZonaLocalidade, string> = {
  urbana: "Urbana",
  rural: "Rural",
};

export function isTipoLocalidade(valor: string): valor is TipoLocalidade {
  return valor in TIPO_LOCALIDADE_LABEL;
}

export function isZonaLocalidade(valor: string): valor is ZonaLocalidade {
  return valor in ZONA_LOCALIDADE_LABEL;
}

export type EscolaInformacoes = {
  telefone: string | null;
  email: string | null;
  diretorNome: string | null;
  viceDiretorNome: string | null;
  secretarioNome: string | null;
  horarioFuncionamento: string | null;
  observacoes: string | null;
};

export type LocalidadeEscola = {
  id: string;
  nome: string;
  tipo: TipoLocalidade;
  zona: ZonaLocalidade;
};

export type RotaOnibus = {
  id: string;
  nome: string;
  turno: string | null;
  motorista: string | null;
  monitor: string | null;
  observacoes: string | null;
};
