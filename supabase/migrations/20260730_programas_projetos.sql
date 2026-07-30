-- Programas e Projetos da escola
-- Projetos e programas compartilham a mesma estrutura e se distinguem pelo
-- tipo; a etapa separa Ensino Fundamental de Educação Infantil.

create table if not exists programas_projetos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  tipo text not null check (tipo in ('projeto', 'programa')),
  etapa text not null check (etapa in ('fundamental', 'infantil')),
  nome text not null,
  descricao text,
  responsavel text,
  data_inicio date,
  data_fim date,
  created_at timestamptz not null default now()
);

create index if not exists idx_programas_projetos_escola
  on programas_projetos (escola_id, tipo, etapa, nome);

create table if not exists programas_projetos_alunos (
  id uuid primary key default gen_random_uuid(),
  programa_projeto_id uuid not null
    references programas_projetos(id) on delete cascade,
  aluno_id uuid not null references alunos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (programa_projeto_id, aluno_id)
);

alter table programas_projetos enable row level security;
alter table programas_projetos_alunos enable row level security;

drop policy if exists programas_projetos_gestor on programas_projetos;
create policy programas_projetos_gestor on programas_projetos for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

drop policy if exists programas_projetos_coordenador on programas_projetos;
create policy programas_projetos_coordenador on programas_projetos for select
  using (get_my_role() = 'coordenador' and escola_id = get_my_escola_id());

drop policy if exists programas_projetos_admin on programas_projetos;
create policy programas_projetos_admin on programas_projetos for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = programas_projetos.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists programas_projetos_alunos_gestor on programas_projetos_alunos;
create policy programas_projetos_alunos_gestor on programas_projetos_alunos for all
  using (
    get_my_role() = 'gestor_escolar'
    and exists (
      select 1 from programas_projetos pp
      where pp.id = programas_projetos_alunos.programa_projeto_id
        and pp.escola_id = get_my_escola_id()
    )
  );

drop policy if exists programas_projetos_alunos_coordenador on programas_projetos_alunos;
create policy programas_projetos_alunos_coordenador
  on programas_projetos_alunos for select
  using (
    get_my_role() = 'coordenador'
    and exists (
      select 1 from programas_projetos pp
      where pp.id = programas_projetos_alunos.programa_projeto_id
        and pp.escola_id = get_my_escola_id()
    )
  );

drop policy if exists programas_projetos_alunos_admin on programas_projetos_alunos;
create policy programas_projetos_alunos_admin
  on programas_projetos_alunos for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1
      from programas_projetos pp
      join escolas e on e.id = pp.escola_id
      where pp.id = programas_projetos_alunos.programa_projeto_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );
