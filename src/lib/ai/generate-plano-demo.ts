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

  return `1. IDENTIFICAÇÃO

Tema: ${input.tema}
Ano/série: ${input.serie}
Disciplina: ${disciplina}
Professor(a): ${input.professorNome}
Duração: 50 minutos
Data de elaboração: ${data}
Observação: Plano gerado em modo demonstração (estrutura BNCC). Configure GEMINI_API_KEY ou OPENAI_API_KEY para conteúdo enriquecido por IA.

2. OBJETIVOS DE APRENDIZAGEM (BNCC)

- Compreender conceitos centrais relacionados a "${input.tema}" na perspectiva de ${input.serie}.
- Relacionar o conteúdo estudado com situações do cotidiano e da realidade local.
- Participar ativamente das atividades propostas, registrando aprendizagens por meio de produções orais e escritas.

3. HABILIDADES BNCC

- Desenvolver leitura, interpretação e comunicação de ideias sobre o tema (Língua Portuguesa / linguagens).
- Utilizar raciocínio lógico e estratégias de resolução de problemas quando aplicável (Matemática / ciências).
- Trabalhar colaborativamente, respeitando turnos de fala e a diversidade do grupo.

4. CONTEÚDOS

- Conceitos fundamentais de "${input.tema}".
- Vocabulário específico da disciplina ${disciplina}.
- Conexões interdisciplinares com outras áreas do conhecimento da ${input.serie}.

5. METODOLOGIA

Introdução (10 min)
- Retomada de conhecimentos prévios com perguntas orientadoras sobre ${input.tema}.
- Problematização: apresentar uma situação real ou imagem motivadora.

Desenvolvimento (30 min)
- Exposição dialogada com registros no quadro ou cartazes.
- Atividade em duplas ou trios: investigação guiada sobre aspectos do tema.
- Socialização das produções com mediação do professor.

Encerramento (10 min)
- Síntese coletiva dos aprendizados.
- Registro individual: "O que aprendi hoje?" em 3 linhas.

6. RECURSOS DIDÁTICOS

- Quadro e marcadores
- Material impresso ou digital (textos, imagens)
- Caderno dos estudantes
- Recursos disponíveis na escola (laboratório, biblioteca, laboratório de informática — se aplicável)

7. AVALIAÇÃO

- Observação da participação durante as atividades.
- Análise das produções escritas/orais entregues ao final da aula.
- Critérios: compreensão do tema, clareza na comunicação, engajamento e trabalho colaborativo.
- Feedback formativo ao encerrar a aula, com orientações para continuidade.

8. REFLEXÃO / ADAPTAÇÕES

- Adaptar tempo das etapas conforme o ritmo da turma.
- Oferecer apoio visual (fluxogramas, pictogramas) para estudantes que necessitarem.
- Ampliar desafios para estudantes que concluírem antes: pergunta investigativa extra sobre ${input.tema}.
- Registrar no diário o que funcionou e o que precisa ser reajustado na próxima aula.`;
}
