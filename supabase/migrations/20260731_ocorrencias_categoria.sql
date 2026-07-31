-- Categoria das ocorrências: alunos ou estrutura da unidade

alter table ocorrencias
  add column if not exists categoria text not null default 'alunos';

alter table ocorrencias
  drop constraint if exists ocorrencias_categoria_check;

alter table ocorrencias
  add constraint ocorrencias_categoria_check
  check (categoria in ('alunos', 'estrutura'));
