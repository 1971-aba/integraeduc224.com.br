-- Código legado da turma (ex.: ID 54 no menu Atualizar Dados → Frequência Turma).
alter table turmas
  add column if not exists codigo integer;

create unique index if not exists idx_turmas_escola_ano_codigo
  on turmas (escola_id, ano_letivo_id, codigo)
  where codigo is not null;
