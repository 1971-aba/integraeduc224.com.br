-- Documentação do aluno
-- CPF e NIS já estão em alunos. Os demais documentos ficam em
-- alunos_complementares, guardados apenas com dígitos quando têm formato fixo.

alter table alunos_complementares
  add column if not exists rg text,
  add column if not exists rg_orgao_emissor text,
  add column if not exists certidao_nascimento text,
  add column if not exists codigo_inep text,
  add column if not exists cartao_sus text;

-- Identificadores nacionais não se repetem entre alunos da mesma rede.
create unique index if not exists alunos_complementares_codigo_inep_key
  on alunos_complementares (codigo_inep)
  where codigo_inep is not null;

create unique index if not exists alunos_complementares_cartao_sus_key
  on alunos_complementares (cartao_sus)
  where cartao_sus is not null;
