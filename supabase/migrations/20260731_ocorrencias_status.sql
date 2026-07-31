-- Status das ocorrências de estrutura: informada ou atendida

alter table ocorrencias
  add column if not exists status text not null default 'informada';

alter table ocorrencias
  drop constraint if exists ocorrencias_status_check;

alter table ocorrencias
  add constraint ocorrencias_status_check
  check (status in ('informada', 'atendida'));
