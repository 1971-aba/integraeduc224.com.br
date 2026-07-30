export type DocumentoAlunoId = "cpf" | "rg" | "rc" | "nis" | "censo" | "sus";

export type DocumentoAluno = {
  id: DocumentoAlunoId;
  /** Rótulo usado no menu. */
  titulo: string;
  nome: string;
  descricao: string;
  placeholder: string;
  ajuda: string;
  tabela: "alunos" | "alunos_complementares";
  coluna: string;
  /** Quantidade exata de dígitos; nulo quando o documento é texto livre. */
  digitos: number | null;
};

export const DOCUMENTOS_ALUNO: Record<DocumentoAlunoId, DocumentoAluno> = {
  cpf: {
    id: "cpf",
    titulo: "Cadastrar CPF",
    nome: "CPF",
    descricao: "Cadastro de Pessoa Física do aluno",
    placeholder: "000.000.000-00",
    ajuda: "11 dígitos. Os dígitos verificadores são conferidos ao salvar.",
    tabela: "alunos",
    coluna: "cpf",
    digitos: 11,
  },
  rg: {
    id: "rg",
    titulo: "Cadastrar RG",
    nome: "RG",
    descricao: "Registro Geral (carteira de identidade)",
    placeholder: "Número do RG",
    ajuda: "Informe também o órgão emissor e a UF, quando houver.",
    tabela: "alunos_complementares",
    coluna: "rg",
    digitos: null,
  },
  rc: {
    id: "rc",
    titulo: "Cadastrar RC",
    nome: "Registro Civil",
    descricao: "Certidão de nascimento do aluno",
    placeholder: "Matrícula da certidão (32 dígitos)",
    ajuda:
      "Aceita a matrícula de 32 dígitos do modelo novo ou o registro antigo em livro, folha e termo.",
    tabela: "alunos_complementares",
    coluna: "certidao_nascimento",
    digitos: null,
  },
  nis: {
    id: "nis",
    titulo: "Código NIS",
    nome: "NIS",
    descricao: "Número de Identificação Social do aluno",
    placeholder: "00000000000",
    ajuda: "11 dígitos, usado nos programas sociais e no Bolsa Família.",
    tabela: "alunos",
    coluna: "nis",
    digitos: 11,
  },
  censo: {
    id: "censo",
    titulo: "Código Censo",
    nome: "Código do Censo (INEP)",
    descricao: "Identificação única do aluno no Censo Escolar",
    placeholder: "000000000000",
    ajuda: "12 dígitos, gerado pelo INEP e não repetido entre alunos.",
    tabela: "alunos_complementares",
    coluna: "codigo_inep",
    digitos: 12,
  },
  sus: {
    id: "sus",
    titulo: "Código SUS",
    nome: "Cartão SUS",
    descricao: "Cartão Nacional de Saúde do aluno",
    placeholder: "000 0000 0000 0000",
    ajuda: "15 dígitos do Cartão Nacional de Saúde.",
    tabela: "alunos_complementares",
    coluna: "cartao_sus",
    digitos: 15,
  },
};

export const DOCUMENTOS_ALUNO_IDS = Object.keys(
  DOCUMENTOS_ALUNO,
) as DocumentoAlunoId[];

export function isDocumentoAlunoId(valor: string): valor is DocumentoAlunoId {
  return valor in DOCUMENTOS_ALUNO;
}

export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

/** Confere os dois dígitos verificadores do CPF. */
export function isCpfValido(digitos: string) {
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  for (const posicao of [9, 10]) {
    let soma = 0;

    for (let i = 0; i < posicao; i++) {
      soma += Number(digitos[i]) * (posicao + 1 - i);
    }

    const resto = (soma * 10) % 11;
    const esperado = resto === 10 ? 0 : resto;

    if (esperado !== Number(digitos[posicao])) return false;
  }

  return true;
}

export function formatarDocumento(
  documento: DocumentoAluno,
  valor: string,
): string {
  if (documento.id === "cpf") {
    return valor
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  if (documento.id === "sus") {
    return valor.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
  }

  return valor;
}

export type ResultadoValidacao =
  | { ok: true; valor: string }
  | { ok: false; error: string };

export function validarDocumento(
  documento: DocumentoAluno,
  bruto: string,
): ResultadoValidacao {
  const valor = bruto.trim();

  if (!valor) return { ok: false, error: `Informe o ${documento.nome}.` };

  if (documento.digitos === null) {
    if (valor.length < 3) {
      return {
        ok: false,
        error: `O ${documento.nome} informado é curto demais.`,
      };
    }
    return { ok: true, valor };
  }

  const digitos = apenasDigitos(valor);

  if (digitos.length !== documento.digitos) {
    return {
      ok: false,
      error: `O ${documento.nome} deve ter ${documento.digitos} dígitos.`,
    };
  }

  if (documento.id === "cpf" && !isCpfValido(digitos)) {
    return { ok: false, error: "CPF inválido: confira os dígitos verificadores." };
  }

  return { ok: true, valor: digitos };
}
