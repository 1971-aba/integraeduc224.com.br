-- Atividades complementares e Acompanhamento do AEE
-- Turmas, atividades e vínculos próprios, separados das turmas regulares.

create table if not exists atividades_extras (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  tipo text not null check (tipo in ('complementar', 'aee')),
  nome text not null,
  descricao text,
  carga_horaria_semanal integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_atividades_extras_escola
  on atividades_extras (escola_id, tipo, nome);

create table if not exists turmas_extras (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  tipo text not null check (tipo in ('complementar', 'aee')),
  nome text not null,
  turno text not null default 'manha',
  local text,
  atividade_id uuid references atividades_extras(id) on delete set null,
  professor_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_turmas_extras_escola
  on turmas_extras (escola_id, tipo, nome);

create table if not exists turmas_extras_alunos (
  id uuid primary key default gen_random_uuid(),
  turma_extra_id uuid not null references turmas_extras(id) on delete cascade,
  aluno_id uuid not null references alunos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (turma_extra_id, aluno_id)
);

create table if not exists turmas_extras_disciplinas (
  id uuid primary key default gen_random_uuid(),
  turma_extra_id uuid not null references turmas_extras(id) on delete cascade,
  disciplina_id uuid not null references disciplinas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (turma_extra_id, disciplina_id)
);

create table if not exists horarios_extras (
  id uuid primary key default gen_random_uuid(),
  turma_extra_id uuid not null references turmas_extras(id) on delete cascade,
  dia_semana integer not null check (dia_semana between 1 and 5),
  hora_inicio time not null,
  hora_fim time not null,
  created_at timestamptz not null default now(),
  unique (turma_extra_id, dia_semana, hora_inicio)
);

alter table atividades_extras enable row level security;
alter table turmas_extras enable row level security;
alter table turmas_extras_alunos enable row level security;
alter table turmas_extras_disciplinas enable row level security;
alter table horarios_extras enable row level security;

-- atividades_extras
drop policy if exists atividades_extras_gestor on atividades_extras;
create policy atividades_extras_gestor on atividades_extras for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

drop policy if exists atividades_extras_coordenador on atividades_extras;
create policy atividades_extras_coordenador on atividades_extras for select
  using (get_my_role() = 'coordenador' and escola_id = get_my_escola_id());

drop policy if exists atividades_extras_admin on atividades_extras;
create policy atividades_extras_admin on atividades_extras for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = atividades_extras.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- turmas_extras
drop policy if exists turmas_extras_gestor on turmas_extras;
create policy turmas_extras_gestor on turmas_extras for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

drop policy if exists turmas_extras_coordenador on turmas_extras;
create policy turmas_extras_coordenador on turmas_extras for select
  using (get_my_role() = 'coordenador' and escola_id = get_my_escola_id());

drop policy if exists turmas_extras_professor on turmas_extras;
create policy turmas_extras_professor on turmas_extras for select
  using (get_my_role() = 'professor' and professor_id = auth.uid());

drop policy if exists turmas_extras_admin on turmas_extras;
create policy turmas_extras_admin on turmas_extras for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = turmas_extras.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- turmas_extras_alunos
drop policy if exists turmas_extras_alunos_gestor on turmas_extras_alunos;
create policy turmas_extras_alunos_gestor on turmas_extras_alunos for all
  using (
    get_my_role() = 'gestor_escolar'
    and exists (
      select 1 from turmas_extras te
      where te.id = turmas_extras_alunos.turma_extra_id
        and te.escola_id = get_my_escola_id()
    )
  );

drop policy if exists turmas_extras_alunos_professor on turmas_extras_alunos;
create policy turmas_extras_alunos_professor on turmas_extras_alunos for select
  using (
    get_my_role() = 'professor'
    and exists (
      select 1 from turmas_extras te
      where te.id = turmas_extras_alunos.turma_extra_id
        and te.professor_id = auth.uid()
    )
  );

drop policy if exists turmas_extras_alunos_admin on turmas_extras_alunos;
create policy turmas_extras_alunos_admin on turmas_extras_alunos for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1
      from turmas_extras te
      join escolas e on e.id = te.escola_id
      where te.id = turmas_extras_alunos.turma_extra_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- turmas_extras_disciplinas
drop policy if exists turmas_extras_disc_gestor on turmas_extras_disciplinas;
create policy turmas_extras_disc_gestor on turmas_extras_disciplinas for all
  using (
    get_my_role() = 'gestor_escolar'
    and exists (
      select 1 from turmas_extras te
      where te.id = turmas_extras_disciplinas.turma_extra_id
        and te.escola_id = get_my_escola_id()
    )
  );

drop policy if exists turmas_extras_disc_professor on turmas_extras_disciplinas;
create policy turmas_extras_disc_professor on turmas_extras_disciplinas for select
  using (
    get_my_role() = 'professor'
    and exists (
      select 1 from turmas_extras te
      where te.id = turmas_extras_disciplinas.turma_extra_id
        and te.professor_id = auth.uid()
    )
  );

drop policy if exists turmas_extras_disc_admin on turmas_extras_disciplinas;
create policy turmas_extras_disc_admin on turmas_extras_disciplinas for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1
      from turmas_extras te
      join escolas e on e.id = te.escola_id
      where te.id = turmas_extras_disciplinas.turma_extra_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- horarios_extras
drop policy if exists horarios_extras_gestor on horarios_extras;
create policy horarios_extras_gestor on horarios_extras for all
  using (
    get_my_role() = 'gestor_escolar'
    and exists (
      select 1 from turmas_extras te
      where te.id = horarios_extras.turma_extra_id
        and te.escola_id = get_my_escola_id()
    )
  );

drop policy if exists horarios_extras_professor on horarios_extras;
create policy horarios_extras_professor on horarios_extras for select
  using (
    get_my_role() = 'professor'
    and exists (
      select 1 from turmas_extras te
      where te.id = horarios_extras.turma_extra_id
        and te.professor_id = auth.uid()
    )
  );

drop policy if exists horarios_extras_admin on horarios_extras;
create policy horarios_extras_admin on horarios_extras for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1
      from turmas_extras te
      join escolas e on e.id = te.escola_id
      where te.id = horarios_extras.turma_extra_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );
