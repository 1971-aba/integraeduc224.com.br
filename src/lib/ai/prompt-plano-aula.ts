import { classificarSerieBoletim } from "@/lib/professor-boletim";

type PlanoPromptInput = {
  tema: string;
  serie: string;
  disciplina?: string;
  professorNome: string;
};

export function buildPlanoAulaPrompt({
  tema,
  serie,
  disciplina,
  professorNome,
}: PlanoPromptInput) {
  const disciplinaTexto = disciplina
    ? `Disciplina/componente curricular: ${disciplina}.`
    : "Disciplina/componente curricular: inferir com base no tema e na série.";

  const infantil = classificarSerieBoletim(serie) === "infantil";

  const titulos = [
    "IDENTIFICAÇÃO",
    "OBJETIVOS DE APRENDIZAGEM (BNCC)",
    ...(infantil ? ["CAMPOS DE EXPERIÊNCIA (BNCC)"] : []),
    "HABILIDADES BNCC",
    "CONTEÚDOS",
    "METODOLOGIA",
    "RECURSOS DIDÁTICOS",
    "AVALIAÇÃO",
    "REFLEXÃO / ADAPTAÇÕES",
  ]
    .map((titulo, index) => `${index + 1}. ${titulo}`)
    .join("\n");

  const orientacaoNivel = infantil
    ? `Em "CAMPOS DE EXPERIÊNCIA (BNCC)", relacione os cinco campos da Educação Infantil ("O eu, o outro e o nós"; "Corpo, gestos e movimentos"; "Traços, sons, cores e formas"; "Escuta, fala, pensamento e imaginação"; "Espaços, tempos, quantidades, relações e transformações"), indicando como cada um será contemplado.
Use códigos de objetivos de aprendizagem e desenvolvimento no formato EIxxYY01 quando aplicável.`
    : `Em "HABILIDADES BNCC", cite códigos no formato EFxxYY01 quando aplicável (Ensino Fundamental) ou EM13XXX01 (Ensino Médio).
Se não tiver certeza do código exato, descreva a habilidade e indique a área do conhecimento.`;

  const system = `Você é um assistente pedagógico especializado na Base Nacional Comum Curricular (BNCC) do Brasil.
Sua tarefa é elaborar planos de aula completos, práticos e adequados à realidade das escolas públicas municipais.
Responda sempre em português do Brasil, com linguagem clara e profissional.
Estruture o plano EXATAMENTE com os títulos abaixo (mantenha os títulos e a numeração):

${titulos}

${orientacaoNivel}`;

  const user = `Elabore um plano de aula com os seguintes dados:

Tema da aula: ${tema}
Ano/série: ${serie}
${disciplinaTexto}
Professor(a): ${professorNome}

Requisitos:
- Proponha atividades viáveis em sala de aula com tempo de 50 minutos
- Inclua estratégias inclusivas
- Alinhe objetivos, habilidades e avaliação à BNCC
- Seja específico ao tema informado`;

  return { system, user };
}
