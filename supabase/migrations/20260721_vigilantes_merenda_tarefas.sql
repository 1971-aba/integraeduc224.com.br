-- Escala de vigilantes, merenda escolar e tarefas docentes

create table if not exists escala_vigilantes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  data date not null,
  turno text not null default 'manha',
  vigilante_nome text not null,
  observacao text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_escala_vigilantes_escola_data
  on escala_vigilantes (escola_id, data desc);

create table if not exists merenda_registros (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  data date not null default current_date,
  refeicao text not null default 'almoco',
  cardapio text not null,
  qtd_alunos integer not null default 0,
  observacao text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_merenda_escola_data
  on merenda_registros (escola_id, data desc);

create table if not exists tarefas_escolares (
  id uuid primary key default gen_random_uuid(),
  atribuicao_id uuid not null references atribuicoes_docentes(id) on delete cascade,
  titulo text not null,
  descricao text not null,
  data_entrega date not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_tarefas_atribuicao
  on tarefas_escolares (atribuicao_id, data_entrega desc);

alter table escala_vigilantes enable row level security;
alter table merenda_registros enable row level security;
alter table tarefas_escolares enable row level security;
