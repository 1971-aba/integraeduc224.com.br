-- Formação acadêmica e cursos dos professores

create table if not exists professor_formacao (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references profiles(id) on delete cascade,
  titulo text not null,
  instituicao text,
  tipo text not null check (
    tipo in (
      'graduacao',
      'especializacao',
      'mestrado',
      'doutorado',
      'pos_doutorado',
      'outro'
    )
  ),
  carga_horaria integer,
  ano_conclusao smallint,
  created_at timestamptz not null default now()
);

create index if not exists professor_formacao_professor_idx
  on professor_formacao (professor_id);

alter table professor_formacao enable row level security;

drop policy if exists professor_formacao_gestor on professor_formacao;
create policy professor_formacao_gestor on professor_formacao for all
  using (
    get_my_role() in ('gestor_escolar', 'admin_sme')
    and exists (
      select 1 from profiles p
      where p.id = professor_formacao.professor_id
        and p.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists professor_formacao_coordenador on professor_formacao;
create policy professor_formacao_coordenador on professor_formacao for select
  using (
    get_my_role() = 'coordenador'
    and exists (
      select 1 from profiles p
      where p.id = professor_formacao.professor_id
        and p.escola_id = get_my_escola_id()
    )
  );

drop policy if exists professor_formacao_proprio on professor_formacao;
create policy professor_formacao_proprio on professor_formacao for select
  using (
    get_my_role() = 'professor'
    and professor_id = auth.uid()
  );
