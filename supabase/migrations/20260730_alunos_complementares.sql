-- Dados complementares do aluno
-- Cor/raça e etnia seguem as categorias do Censo Escolar. A fotografia fica no
-- Storage; aqui guardamos apenas o caminho do arquivo.

create table if not exists alunos_complementares (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos(id) on delete cascade,
  cor_raca text check (
    cor_raca in (
      'branca',
      'preta',
      'parda',
      'amarela',
      'indigena',
      'nao_declarada'
    )
  ),
  etnia_indigena text,
  foto_path text,
  atualizado_por uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (aluno_id)
);

alter table alunos_complementares enable row level security;

drop policy if exists alunos_complementares_rede on alunos_complementares;
create policy alunos_complementares_rede on alunos_complementares for all
  using (
    get_my_role() in ('gestor_escolar', 'admin_sme')
    and exists (
      select 1 from alunos a
      where a.id = alunos_complementares.aluno_id
        and a.secretaria_id = get_my_secretaria_id()
    )
  );

drop policy if exists alunos_complementares_coordenador on alunos_complementares;
create policy alunos_complementares_coordenador
  on alunos_complementares for select
  using (
    get_my_role() = 'coordenador'
    and exists (
      select 1 from alunos a
      where a.id = alunos_complementares.aluno_id
        and a.secretaria_id = get_my_secretaria_id()
    )
  );

-- Fotografias: bucket privado, uma pasta por escola.
insert into storage.buckets (id, name, public)
values ('alunos-fotos', 'alunos-fotos', false)
on conflict (id) do nothing;

drop policy if exists alunos_fotos_gestor on storage.objects;
create policy alunos_fotos_gestor on storage.objects for all
  to authenticated
  using (
    bucket_id = 'alunos-fotos'
    and get_my_role() = 'gestor_escolar'
    and (storage.foldername(name))[1] = get_my_escola_id()::text
  );

drop policy if exists alunos_fotos_leitura_escola on storage.objects;
create policy alunos_fotos_leitura_escola on storage.objects for select
  to authenticated
  using (
    bucket_id = 'alunos-fotos'
    and get_my_role() in ('coordenador', 'professor')
    and (storage.foldername(name))[1] = get_my_escola_id()::text
  );
