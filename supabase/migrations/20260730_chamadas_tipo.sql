-- Tipos de frequência: regular, complementar, aee

alter table chamadas
  add column if not exists tipo text not null default 'regular'
    check (tipo in ('regular', 'complementar', 'aee'));

alter table chamadas
  add column if not exists observacao text;

alter table chamadas drop constraint if exists chamadas_atribuicao_id_data_key;

create unique index if not exists chamadas_atribuicao_data_tipo_key
  on chamadas (atribuicao_id, data, tipo);
