import { classificarSerieBoletim } from "@/lib/professor-boletim";

type GeneratePlanoInput = {
  tema: string;
  serie: string;
  disciplina?: string;
  professorNome: string;
};

export function generatePlanoAulaDemo(input: GeneratePlanoInput) {
  const disciplina =
    input.disciplina?.trim() || "Componente curricular (inferido pelo tema)";
  const data = new Date().toLocaleDateString("pt-BR");
  const infantil = classificarSerieBoletim(input.serie) === "infantil";

  const secoes: Array<{ titulo: string; corpo: string }> = [
    {
      titulo: "IDENTIFICAÇÃO",
      corpo: `Tema: ${input.tema}
Ano/série: ${input.serie}
Disciplina: ${disciplina}
Professor(a): ${input.professorNome}
Duração: 50 minutos
Data de elaboração: ${data}
Observação: Plano gerado em modo demonstração (estrutura BNCC). Configure GEMINI_API_KEY ou OPENAI_API_KEY para conteúdo enriquecido por IA.`,
    },
    {
      titulo: "OBJETIVOS DE APRENDIZAGEM (BNCC)",
      corpo: `- Compreender conceitos centrais relacionados a "${input.tema}" na perspectiva de ${input.serie}.
- Relacionar o conteúdo estudado com situações do cotidiano e da realidade local.
- Participar ativamente das atividades propostas, registrando aprendizagens por meio de produções orais e escritas.`,
    },
  ];

  if (infantil) {
    secoes.push({
      titulo: "CAMPOS DE EXPERIÊNCIA (BNCC)",
      corpo: `- O eu, o outro e o nós: interações no grupo a partir de "${input.tema}", com atenção ao respeito às diferenças.
- Corpo, gestos e movimentos: exploração corporal e sensorial ligada ao tema.
- Traços, sons, cores e formas: expressão por desenho, música e materiais variados.
- Escuta, fala, pensamento e imaginação: roda de conversa, história e ampliação de vocabulário sobre ${input.tema}.
- Espaços, tempos, quantidades, relações e transformações: observação, comparação e contagem em situações concretas.`,
    });
  }

  secoes.push(
    {
      titulo: "HABILIDADES BNCC",
      corpo: `- Desenvolver leitura, interpretação e comunicação de ideias sobre o tema (Língua Portuguesa / linguagens).
- Utilizar raciocínio lógico e estratégias de resolução de problemas quando aplicável (Matemática / ciências).
- Trabalhar colaborativamente, respeitando turnos de fala e a diversidade do grupo.`,
    },
    {
      titulo: "CONTEÚDOS",
      corpo: `- Conceitos fundamentais de "${input.tema}".
- Vocabulário específico da disciplina ${disciplina}.
- Conexões interdisciplinares com outras áreas do conhecimento da ${input.serie}.`,
    },
    {
      titulo: "METODOLOGIA",
      corpo: `Introdução (10 min)
- Retomada de conhecimentos prévios com perguntas orientadoras sobre ${input.tema}.
- Problematização: apresentar uma situação real ou imagem motivadora.

Desenvolvimento (30 min)
- Exposição dialogada com registros no quadro ou cartazes.
- Atividade em duplas ou trios: investigação guiada sobre aspectos do tema.
- Socialização das produções com mediação do professor.

Encerramento (10 min)
- Síntese coletiva dos aprendizados.
- Registro individual: "O que aprendi hoje?" em 3 linhas.`,
    },
    {
      titulo: "RECURSOS DIDÁTICOS",
      corpo: `- Quadro e marcadores
- Material impresso ou digital (textos, imagens)
- Caderno dos estudantes
- Recursos disponíveis na escola (laboratório, biblioteca, laboratório de informática — se aplicável)`,
    },
    {
      titulo: "AVALIAÇÃO",
      corpo: `- Observação da participação durante as atividades.
- Análise das produções escritas/orais entregues ao final da aula.
- Critérios: compreensão do tema, clareza na comunicação, engajamento e trabalho colaborativo.
- Feedback formativo ao encerrar a aula, com orientações para continuidade.`,
    },
    {
      titulo: "REFLEXÃO / ADAPTAÇÕES",
      corpo: `- Adaptar tempo das etapas conforme o ritmo da turma.
- Oferecer apoio visual (fluxogramas, pictogramas) para estudantes que necessitarem.
- Ampliar desafios para estudantes que concluírem antes: pergunta investigativa extra sobre ${input.tema}.
- Registrar no diário o que funcionou e o que precisa ser reajustado na próxima aula.`,
    },
  );

  return secoes
    .map((secao, index) => `${index + 1}. ${secao.titulo}\n\n${secao.corpo}`)
    .join("\n\n");
}
