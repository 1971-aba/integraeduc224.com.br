-- Estoque de insumos da merenda escolar por unidade

create table if not exists merenda_estoque (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  nome text not null,
  quantidade numeric not null default 0,
  unidade text not null default 'kg',
  estoque_minimo numeric not null default 0,
  validade date,
  created_at timestamptz not null default now()
);

create index if not exists idx_merenda_estoque_escola
  on merenda_estoque (escola_id, nome);

alter table merenda_estoque enable row level security;

create policy merenda_estoque_gestor on merenda_estoque for all
  using (escola_id = (select escola_id from profiles where id = auth.uid()));

create policy merenda_estoque_admin on merenda_estoque for all
  using (
    exists (
      select 1 from escolas e
      join profiles p on p.id = auth.uid()
      where e.id = merenda_estoque.escola_id
        and e.secretaria_id = p.secretaria_id
        and p.role = 'admin_sme'
    )
  );
