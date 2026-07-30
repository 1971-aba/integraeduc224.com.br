
-- Entrada diária de alunos e folgas escolares

create table if not exists entradas_alunos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  matricula_id uuid not null references matriculas(id) on delete cascade,
  data date not null default current_date,
  hora time not null default current_time,
  registrado_por uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (matricula_id, data)
);

create index if not exists idx_entradas_escola_data
  on entradas_alunos (escola_id, data desc);

create table if not exists folgas_escolares (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  titulo text not null,
  data_inicio date not null,
  data_fim date not null,
  descricao text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_folgas_escola
  on folgas_escolares (escola_id, data_inicio desc);

alter table entradas_alunos enable row level security;
alter table folgas_escolares enable row level security;
