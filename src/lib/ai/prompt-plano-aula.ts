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

  const system = `Você é um assistente pedagógico especializado na Base Nacional Comum Curricular (BNCC) do Brasil.
Sua tarefa é elaborar planos de aula completos, práticos e adequados à realidade das escolas públicas municipais.
Responda sempre em português do Brasil, com linguagem clara e profissional.
Estruture o plano EXATAMENTE com os títulos abaixo (mantenha os títulos):

1. IDENTIFICAÇÃO
2. OBJETIVOS DE APRENDIZAGEM (BNCC)
3. HABILIDADES BNCC
4. CONTEÚDOS
5. METODOLOGIA
6. RECURSOS DIDÁTICOS
7. AVALIAÇÃO
8. REFLEXÃO / ADAPTAÇÕES

Em "HABILIDADES BNCC", cite códigos no formato EFxxYY01 quando aplicável (Ensino Fundamental) ou EM13XXX01 (Ensino Médio).
Se não tiver certeza do código exato, descreva a habilidade e indique a área do conhecimento.`;

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
