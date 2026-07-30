-- RLS policies for operational modules (gestor, professor, SGA)

-- Helper: escola belongs to user's secretaria (admin SME)
-- Pattern reused inline per table

-- escala_vigilantes
create policy escala_vigilantes_gestor on escala_vigilantes for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy escala_vigilantes_admin on escala_vigilantes for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = escala_vigilantes.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- merenda_registros
create policy merenda_gestor on merenda_registros for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy merenda_admin on merenda_registros for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = merenda_registros.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- tarefas_escolares
create policy tarefas_professor on tarefas_escolares for all
  using (get_my_role() = 'professor' and is_my_atribuicao(atribuicao_id));

create policy tarefas_gestor on tarefas_escolares for all
  using (
    get_my_role() = 'gestor_escolar'
    and atribuicao_escola_id(atribuicao_id) = get_my_escola_id()
  );

create policy tarefas_admin_read on tarefas_escolares for select
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1
      from atribuicoes_docentes ad
      join turmas t on t.id = ad.turma_id
      join escolas e on e.id = t.escola_id
      where ad.id = tarefas_escolares.atribuicao_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- almoxarifado_itens
create policy almoxarifado_itens_gestor on almoxarifado_itens for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy almoxarifado_itens_admin on almoxarifado_itens for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = almoxarifado_itens.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- almoxarifado_movimentos
create policy almoxarifado_mov_gestor on almoxarifado_movimentos for all
  using (
    get_my_role() = 'gestor_escolar'
    and exists (
      select 1 from almoxarifado_itens ai
      where ai.id = almoxarifado_movimentos.item_id
        and ai.escola_id = get_my_escola_id()
    )
  );

create policy almoxarifado_mov_admin on almoxarifado_movimentos for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1
      from almoxarifado_itens ai
      join escolas e on e.id = ai.escola_id
      where ai.id = almoxarifado_movimentos.item_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- estrutura_escolar
create policy estrutura_gestor on estrutura_escolar for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy estrutura_admin on estrutura_escolar for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = estrutura_escolar.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- entradas_alunos
create policy entradas_gestor on entradas_alunos for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy entradas_admin on entradas_alunos for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = entradas_alunos.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- folgas_escolares
create policy folgas_gestor on folgas_escolares for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy folgas_admin on folgas_escolares for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = folgas_escolares.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- reunioes_escolares (gestor + coordenador)
create policy reunioes_gestor on reunioes_escolares for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy reunioes_coordenador on reunioes_escolares for all
  using (get_my_role() = 'coordenador' and escola_id = get_my_escola_id());

create policy reunioes_admin on reunioes_escolares for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = reunioes_escolares.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- ocorrencias (gestor + coordenador)
create policy ocorrencias_gestor on ocorrencias for all
  using (get_my_role() = 'gestor_escolar' and escola_id = get_my_escola_id());

create policy ocorrencias_coordenador on ocorrencias for all
  using (get_my_role() = 'coordenador' and escola_id = get_my_escola_id());

create policy ocorrencias_admin on ocorrencias for all
  using (
    get_my_role() = 'admin_sme'
    and exists (
      select 1 from escolas e
      where e.id = ocorrencias.escola_id
        and e.secretaria_id = get_my_secretaria_id()
    )
  );

-- configuracoes_rede (SGA + admin SME)
create policy config_rede_sga on configuracoes_rede for all
  using (
    get_my_role() in ('tecnico_sga', 'admin_sme')
    and secretaria_id = get_my_secretaria_id()
  );
