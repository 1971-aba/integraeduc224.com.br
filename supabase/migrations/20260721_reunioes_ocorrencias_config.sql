-- Reuniões escolares, ocorrências e configurações da rede

create table if not exists reunioes_escolares (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  ano_letivo_id uuid references anos_letivos(id) on delete set null,
  titulo text not null,
  data date not null,
  hora time,
  local text,
  descricao text,
  tipo text not null default 'reuniao_pedagogica',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reunioes_escola_data
  on reunioes_escolares (escola_id, data desc);

create table if not exists ocorrencias (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  aluno_id uuid references alunos(id) on delete set null,
  titulo text not null,
  descricao text not null,
  tipo text not null default 'disciplinar',
  data date not null default current_date,
  registrado_por uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ocorrencias_escola_data
  on ocorrencias (escola_id, data desc);

create table if not exists configuracoes_rede (
  secretaria_id uuid primary key references secretarias(id) on delete cascade,
  politica_senha jsonb not null default '{
    "minLength": 8,
    "exigeMaiuscula": true,
    "exigeNumero": true,
    "exigeEspecial": false
  }'::jsonb,
  permissoes_sga jsonb not null default '{
    "podeCriarGestor": true,
    "podeCriarAdmin": false,
    "podeDesativarUsuario": true,
    "exigeEmailInstitucional": true
  }'::jsonb,
  updated_at timestamptz not null default now()
);

alter table reunioes_escolares enable row level security;
alter table ocorrencias enable row level security;
alter table configuracoes_rede enable row level security;
