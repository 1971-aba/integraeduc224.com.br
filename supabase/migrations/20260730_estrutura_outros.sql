-- Informações complementares da escola, localidades atendidas e rotas de ônibus

create table if not exists escolas_informacoes (
  escola_id uuid primary key references escolas(id) on delete cascade,
  telefone text,
  email text,
  diretor_nome text,
  vice_diretor_nome text,
  secretario_nome text,
  horario_funcionamento text,
  observacoes text,
  updated_at timestamptz not null default now()
);

create table if not exists escola_localidades (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('bairro', 'povoado')),
  zona text not null check (zona in ('urbana', 'rural')),
  created_at timestamptz not null default now(),
  unique (escola_id, nome)
);

create table if not exists rotas_onibus (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  nome text not null,
  turno text,
  motorista text,
  monitor text,
  observacoes text,
  created_at timestamptz not null default now(),
  unique (escola_id, nome)
);

alter table escolas_informacoes enable row level security;
alter table escola_localidades enable row level security;
alter table rotas_onibus enable row level security;

drop policy if exists escolas_informacoes_gestor on escolas_informacoes;
create policy escolas_informacoes_gestor on escolas_informacoes for all
  using (
    get_my_role() in ('gestor_escolar', 'admin_sme')
    and exists (
      select 1 from escolas e
      where e.id = escolas_informacoes.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists escola_localidades_gestor on escola_localidades;
create policy escola_localidades_gestor on escola_localidades for all
  using (
    get_my_role() in ('gestor_escolar', 'admin_sme')
    and exists (
      select 1 from escolas e
      where e.id = escola_localidades.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists rotas_onibus_gestor on rotas_onibus;
create policy rotas_onibus_gestor on rotas_onibus for all
  using (
    get_my_role() in ('gestor_escolar', 'admin_sme')
    and exists (
      select 1 from escolas e
      where e.id = rotas_onibus.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );
