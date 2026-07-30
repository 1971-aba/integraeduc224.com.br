CREATE TABLE IF NOT EXISTS planos_curso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  atribuicao_id uuid REFERENCES atribuicoes_docentes(id) ON DELETE SET NULL,
  nivel text NOT NULL CHECK (nivel IN ('fundamental', 'infantil')),
  disciplina text NOT NULL,
  serie text NOT NULL,
  titulo text NOT NULL,
  conteudo_ia text NOT NULL,
  conteudo_final text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planos_curso_professor_id_idx ON planos_curso(professor_id);
CREATE INDEX IF NOT EXISTS planos_curso_nivel_idx ON planos_curso(nivel);

ALTER TABLE planos_curso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores gerenciam seus planos de curso"
  ON planos_curso
  FOR ALL
  USING (professor_id = auth.uid())
  WITH CHECK (professor_id = auth.uid());
