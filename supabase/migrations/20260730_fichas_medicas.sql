-- Ficha de informações médicas do aluno
-- Uma ficha por aluno. A tabela alunos guarda apenas dados civis, por isso os
-- dados de saúde ficam separados, com acesso restrito à rede do aluno.

create table if not exists fichas_medicas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos(id) on delete cascade,
  tipo_sanguineo text,
  alergias text,
  medicamentos text,
  restricoes_alimentares text,
  condicoes_saude text,
  plano_saude text,
  unidade_saude text,
  contato_nome text,
  contato_telefone text,
  observacoes text,
  atualizado_por uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (aluno_id)
);

alter table fichas_medicas enable row level security;

drop policy if exists fichas_medicas_rede on fichas_medicas;
create policy fichas_medicas_rede on fichas_medicas for all
  using (
    get_my_role() in ('gestor_escolar', 'admin_sme')
    and exists (
      select 1 from alunos a
      where a.id = fichas_medicas.aluno_id
        and a.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists fichas_medicas_coordenador on fichas_medicas;
create policy fichas_medicas_coordenador on fichas_medicas for select
  using (
    get_my_role() = 'coordenador'
    and exists (
      select 1 from alunos a
      where a.id = fichas_medicas.aluno_id
        and a.secretaria_id = get_my_secretaria_id()
    )
  );

-- O professor precisa conhecer alergias e restrições dos alunos que atende.
drop policy if exists fichas_medicas_professor on fichas_medicas;
create policy fichas_medicas_professor on fichas_medicas for select
  using (
    get_my_role() = 'professor'
    and exists (
      select 1
      from matriculas m
      join atribuicoes_docentes ad on ad.turma_id = m.turma_id
      where m.aluno_id = fichas_medicas.aluno_id
        and m.status = 'ativa'
        and ad.professor_id = auth.uid()
    )
  );
