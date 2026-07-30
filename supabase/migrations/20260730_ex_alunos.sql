-- Cadastro de ex-alunos
-- Guarda quem já estudou na rede e não tem matrícula ativa. A escola de origem
-- indica em qual unidade o histórico foi registrado.

alter table alunos
  add column if not exists tipo_cadastro text not null default 'regular'
    check (tipo_cadastro in ('regular', 'ex_aluno')),
  add column if not exists ultima_serie text,
  add column if not exists ano_conclusao smallint,
  add column if not exists motivo_saida text
    check (
      motivo_saida is null
      or motivo_saida in ('concluido', 'transferido', 'cancelado')
    ),
  add column if not exists escola_origem_id uuid references escolas(id) on delete set null;

create index if not exists alunos_ex_aluno_escola_idx
  on alunos (escola_origem_id)
  where tipo_cadastro = 'ex_aluno';
