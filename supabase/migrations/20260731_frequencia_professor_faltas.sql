-- Faltas diárias de professores da unidade escolar

create table if not exists frequencia_professor_faltas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references escolas(id) on delete cascade,
  professor_id uuid references profiles(id) on delete set null,
  professor_nome text not null,
  data date not null default current_date,
  observacao text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_frequencia_professor_faltas_escola_data
  on frequencia_professor_faltas (escola_id, data desc);

alter table frequencia_professor_faltas enable row level security;

create policy frequencia_professor_faltas_gestor on frequencia_professor_faltas for all
  using (escola_id = (select escola_id from profiles where id = auth.uid()));

create policy frequencia_professor_faltas_admin on frequencia_professor_faltas for all
  using (
    exists (
      select 1 from escolas e
      join profiles p on p.id = auth.uid()
      where e.id = frequencia_professor_faltas.escola_id
        and e.secretaria_id = p.secretaria_id
        and p.role = 'admin_sme'
    )
  );
