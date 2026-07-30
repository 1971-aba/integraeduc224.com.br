-- Almoxarifado e estrutura escolar

create table if not exists almoxarifado_itens (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  nome text not null,
  categoria text not null default 'geral',
  quantidade numeric not null default 0,
  unidade text not null default 'un',
  estoque_minimo numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists almoxarifado_movimentos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references almoxarifado_itens(id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'saida')),
  quantidade numeric not null,
  motivo text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_almoxarifado_escola
  on almoxarifado_itens (escola_id, nome);

create table if not exists estrutura_escolar (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  tipo text not null default 'sala',
  nome text not null,
  capacidade integer,
  descricao text,
  created_at timestamptz not null default now()
);

create index if not exists idx_estrutura_escola
  on estrutura_escolar (escola_id, tipo);

alter table almoxarifado_itens enable row level security;
alter table almoxarifado_movimentos enable row level security;
alter table estrutura_escolar enable row level security;
