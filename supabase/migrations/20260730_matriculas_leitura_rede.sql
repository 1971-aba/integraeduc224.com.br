-- Leitura de matrículas da rede pelo gestor escolar
-- Para receber um aluno de fora (matrícula, transferência ou resgate de
-- evasão), o gestor precisa saber a situação do vínculo dele na rede: se está
-- ativo em outra unidade, se saiu transferido ou se a matrícula foi cancelada.
-- A escrita continua restrita às turmas da própria escola.

drop policy if exists matriculas_gestor_rede_read on matriculas;
create policy matriculas_gestor_rede_read on matriculas for select
  using (
    get_my_role() = 'gestor_escolar'
    and exists (
      select 1
      from turmas t
      join escolas e on e.id = t.escola_id
      where t.id = matriculas.turma_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );
