type GeneratePlanoCursoInput = {
  titulo: string;
  serie: string;
  disciplina: string;
  professorNome: string;
  nivelLabel: string;
};

export function generatePlanoCursoDemo(input: GeneratePlanoCursoInput) {
  const data = new Date().toLocaleDateString("pt-BR");

  return `1. IDENTIFICAÇÃO DO CURSO

Título: ${input.titulo}
Nível: ${input.nivelLabel}
Ano/série: ${input.serie}
Componente curricular: ${input.disciplina}
Professor(a): ${input.professorNome}
Ano letivo: ${new Date().getFullYear()}
Data de elaboração: ${data}
Observação: Plano gerado em modo demonstração (estrutura BNCC). Configure GEMINI_API_KEY ou OPENAI_API_KEY para conteúdo enriquecido por IA.

2. OBJETIVOS GERAIS

- Desenvolver competências previstas na BNCC para ${input.serie} em ${input.disciplina}.
- Articular saberes teóricos e práticos ao longo do ano letivo.
- Promover aprendizagens significativas com foco na realidade dos estudantes.

3. ORGANIZAÇÃO CURRICULAR (POR BIMESTRE)

1º bimestre
- Introdução aos eixos centrais de "${input.titulo}".
- Diagnóstico inicial e acolhimento da turma.

2º bimestre
- Aprofundamento dos conteúdos estruturantes.
- Atividades de consolidação e revisão interdisciplinar.

3º bimestre
- Aplicação dos conteúdos em projetos e situações-problema.
- Recuperação formativa contínua.

4º bimestre
- Síntese anual e preparação para continuidade dos estudos.
- Avaliação somativa e fechamento do ciclo.

4. METODOLOGIA

- Aulas expositivas dialogadas, trabalho em grupo e uso de recursos digitais.
- Problematização, investigação e produção de registros pelos estudantes.
- Articulação com o Projeto Político Pedagógico da escola.

5. AVALIAÇÃO

- Processual e contínua, com registros de observação, produções e participação.
- Instrumentos: provas, trabalhos, seminários e autoavaliação.
- Critérios alinhados às habilidades da BNCC para ${input.serie}.

6. REFERÊNCIAS BNCC

- Base Nacional Comum Curricular — ${input.nivelLabel}.
- Diretrizes Curriculares Nacionais da Educação Básica.
- Documentos pedagógicos oficiais do MEC aplicáveis ao componente ${input.disciplina}.`;
}
