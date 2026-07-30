-- Responsáveis pelo aluno
-- Um aluno pode ter vários responsáveis (mãe, pai, tutor). O nome_mae em
-- alunos continua existindo como atalho legado; o cadastro completo fica aqui.

create table if not exists alunos_responsaveis (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos(id) on delete cascade,
  nome text not null,
  parentesco text not null check (
    parentesco in (
      'mae',
      'pai',
      'avo',
      'tio',
      'irmao',
      'tutor',
      'outro'
    )
  ),
  cpf text,
  rg text,
  telefone text,
  telefone_alt text,
  email text,
  endereco text,
  bairro text,
  cep text,
  local_trabalho text,
  telefone_trabalho text,
  responsavel_legal boolean not null default false,
  autorizado_retirar boolean not null default true,
  observacoes text,
  atualizado_por uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alunos_responsaveis_aluno_idx
  on alunos_responsaveis (aluno_id);

alter table alunos_responsaveis enable row level security;

drop policy if exists alunos_responsaveis_rede on alunos_responsaveis;
create policy alunos_responsaveis_rede on alunos_responsaveis for all
  using (
    get_my_role() in ('gestor_escolar', 'admin_sme')
    and exists (
      select 1 from alunos a
      where a.id = alunos_responsaveis.aluno_id
        and a.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists alunos_responsaveis_coordenador on alunos_responsaveis;
create policy alunos_responsaveis_coordenador
  on alunos_responsaveis for select
  using (
    get_my_role() = 'coordenador'
    and exists (
      select 1 from alunos a
      where a.id = alunos_responsaveis.aluno_id
        and a.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists alunos_responsaveis_professor on alunos_responsaveis;
create policy alunos_responsaveis_professor
  on alunos_responsaveis for select
  using (
    get_my_role() = 'professor'
    and exists (
      select 1
      from matriculas m
      join atribuicoes_docentes ad on ad.turma_id = m.turma_id
      where m.aluno_id = alunos_responsaveis.aluno_id
        and m.status = 'ativa'
        and ad.professor_id = auth.uid()
    )
  );
