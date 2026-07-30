-- Professores vinculados às atividades complementares e ao AEE
-- Uma atividade pode ser conduzida por mais de um professor, independente
-- do professor responsável por cada turma.

create table if not exists atividades_extras_professores (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references atividades_extras(id) on delete cascade,
  professor_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (atividade_id, professor_id)
);

alter table atividades_extras_professores enable row level security;

drop policy if exists atividades_extras_prof_gestor on atividades_extras_professores;
create policy atividades_extras_prof_gestor on atividades_extras_professores for all
  using (
    get_my_role() = 'gestor_escolar'
    and exists (
      select 1 from atividades_extras ae
      where ae.id = atividades_extras_professores.atividade_id
        and ae.escola_id = get_my_escola_id()
    )
  );

drop policy if exists atividades_extras_prof_professor on atividades_extras_professores;
create policy atividades_extras_prof_professor on atividades_extras_professores for select
  using (
    get_my_role() = 'professor'
    and professor_id = auth.uid()
  );

drop policy if exists atividades_extras_prof_admin on atividades_extras_professores;
create policy atividades_extras_prof_admin on atividades_extras_professores for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1
      from atividades_extras ae
      join escolas e on e.id = ae.escola_id
      where ae.id = atividades_extras_professores.atividade_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );
