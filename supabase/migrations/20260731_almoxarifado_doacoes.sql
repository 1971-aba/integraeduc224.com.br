-- Doações de materiais do almoxarifado para alunos

create table if not exists almoxarifado_doacoes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  item_id uuid not null references almoxarifado_itens(id) on delete cascade,
  aluno_id uuid references alunos(id) on delete set null,
  quantidade numeric not null,
  observacao text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_almoxarifado_doacoes_escola
  on almoxarifado_doacoes (escola_id, created_at desc);

alter table almoxarifado_doacoes enable row level security;

create policy almoxarifado_doacoes_gestor on almoxarifado_doacoes for all
  using (escola_id = (select escola_id from profiles where id = auth.uid()));

create policy almoxarifado_doacoes_admin on almoxarifado_doacoes for all
  using (
    exists (
      select 1 from escolas e
      join profiles p on p.id = auth.uid()
      where e.id = almoxarifado_doacoes.escola_id
        and e.secretaria_id = p.secretaria_id
        and p.role = 'admin_sme'
    )
  );
