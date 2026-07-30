export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type PresencaStatusEnum = "presente" | "falta" | "justificada";
type UserRoleEnum =
  | "admin_sme"
  | "gestor_escolar"
  | "coordenador"
  | "professor"
  | "tecnico_sga";

export type TipoAtividadeExtra = "complementar" | "aee";

export type TipoProgramaProjeto = "projeto" | "programa";

export type EtapaProgramaProjeto = "fundamental" | "infantil";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      alunos: {
        Row: {
          id: string;
          secretaria_id: string;
          nome: string;
          cpf: string | null;
          data_nascimento: string | null;
          nome_mae: string | null;
          nis: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          secretaria_id: string;
          nome: string;
          cpf?: string | null;
          data_nascimento?: string | null;
          nome_mae?: string | null;
          nis?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alunos"]["Insert"]>;
        Relationships: [];
      };
      programas_projetos: {
        Row: {
          id: string;
          escola_id: string;
          tipo: TipoProgramaProjeto;
          etapa: EtapaProgramaProjeto;
          nome: string;
          descricao: string | null;
          responsavel: string | null;
          data_inicio: string | null;
          data_fim: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          tipo: TipoProgramaProjeto;
          etapa: EtapaProgramaProjeto;
          nome: string;
          descricao?: string | null;
          responsavel?: string | null;
          data_inicio?: string | null;
          data_fim?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["programas_projetos"]["Insert"]
        >;
        Relationships: [];
      };
      programas_projetos_alunos: {
        Row: {
          id: string;
          programa_projeto_id: string;
          aluno_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          programa_projeto_id: string;
          aluno_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["programas_projetos_alunos"]["Insert"]
        >;
        Relationships: [];
      };
      fichas_medicas: {
        Row: {
          id: string;
          aluno_id: string;
          tipo_sanguineo: string | null;
          alergias: string | null;
          medicamentos: string | null;
          restricoes_alimentares: string | null;
          condicoes_saude: string | null;
          plano_saude: string | null;
          unidade_saude: string | null;
          contato_nome: string | null;
          contato_telefone: string | null;
          observacoes: string | null;
          atualizado_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          aluno_id: string;
          tipo_sanguineo?: string | null;
          alergias?: string | null;
          medicamentos?: string | null;
          restricoes_alimentares?: string | null;
          condicoes_saude?: string | null;
          plano_saude?: string | null;
          unidade_saude?: string | null;
          contato_nome?: string | null;
          contato_telefone?: string | null;
          observacoes?: string | null;
          atualizado_por?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["fichas_medicas"]["Insert"]
        >;
        Relationships: [];
      };
      atividades_extras: {
        Row: {
          id: string;
          escola_id: string;
          tipo: TipoAtividadeExtra;
          nome: string;
          descricao: string | null;
          carga_horaria_semanal: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          tipo: TipoAtividadeExtra;
          nome: string;
          descricao?: string | null;
          carga_horaria_semanal?: number | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["atividades_extras"]["Insert"]
        >;
        Relationships: [];
      };
      atividades_extras_professores: {
        Row: {
          id: string;
          atividade_id: string;
          professor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          atividade_id: string;
          professor_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["atividades_extras_professores"]["Insert"]
        >;
        Relationships: [];
      };
      turmas_extras: {
        Row: {
          id: string;
          escola_id: string;
          tipo: TipoAtividadeExtra;
          nome: string;
          turno: string;
          local: string | null;
          atividade_id: string | null;
          professor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          tipo: TipoAtividadeExtra;
          nome: string;
          turno?: string;
          local?: string | null;
          atividade_id?: string | null;
          professor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["turmas_extras"]["Insert"]
        >;
        Relationships: [];
      };
      turmas_extras_alunos: {
        Row: {
          id: string;
          turma_extra_id: string;
          aluno_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          turma_extra_id: string;
          aluno_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["turmas_extras_alunos"]["Insert"]
        >;
        Relationships: [];
      };
      turmas_extras_disciplinas: {
        Row: {
          id: string;
          turma_extra_id: string;
          disciplina_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          turma_extra_id: string;
          disciplina_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["turmas_extras_disciplinas"]["Insert"]
        >;
        Relationships: [];
      };
      horarios_extras: {
        Row: {
          id: string;
          turma_extra_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fim: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          turma_extra_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fim: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["horarios_extras"]["Insert"]
        >;
        Relationships: [];
      };
      anos_letivos: {
        Row: {
          id: string;
          secretaria_id: string;
          ano: number;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          secretaria_id: string;
          ano: number;
          ativo?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["anos_letivos"]["Insert"]>;
        Relationships: [];
      };
      atribuicoes_docentes: {
        Row: {
          id: string;
          professor_id: string;
          disciplina_id: string;
          turma_id: string;
          ano_letivo_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          professor_id: string;
          disciplina_id: string;
          turma_id: string;
          ano_letivo_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["atribuicoes_docentes"]["Insert"]
        >;
        Relationships: [];
      };
      bimestres: {
        Row: {
          id: string;
          ano_letivo_id: string;
          numero: number;
          data_inicio: string;
          data_fim: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ano_letivo_id: string;
          numero: number;
          data_inicio: string;
          data_fim: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bimestres"]["Insert"]>;
        Relationships: [];
      };
      calendario_eventos: {
        Row: {
          id: string;
          ano_letivo_id: string;
          titulo: string;
          data_inicio: string;
          data_fim: string;
          tipo: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ano_letivo_id: string;
          titulo: string;
          data_inicio: string;
          data_fim: string;
          tipo: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["calendario_eventos"]["Insert"]
        >;
        Relationships: [];
      };
      chamadas: {
        Row: {
          id: string;
          atribuicao_id: string;
          data: string;
          tipo: string;
          observacao: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          atribuicao_id: string;
          data: string;
          tipo?: string;
          observacao?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chamadas"]["Insert"]>;
        Relationships: [];
      };
      configuracoes_rede: {
        Row: {
          secretaria_id: string;
          politica_senha: Json;
          permissoes_sga: Json;
          updated_at: string;
        };
        Insert: {
          secretaria_id: string;
          politica_senha?: Json;
          permissoes_sga?: Json;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["configuracoes_rede"]["Insert"]
        >;
        Relationships: [];
      };
      conteudos_diarios: {
        Row: {
          id: string;
          atribuicao_id: string;
          data: string;
          descricao: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          atribuicao_id: string;
          data: string;
          descricao: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["conteudos_diarios"]["Insert"]
        >;
        Relationships: [];
      };
      ocorrencias: {
        Row: {
          id: string;
          escola_id: string;
          aluno_id: string | null;
          titulo: string;
          descricao: string;
          tipo: string;
          data: string;
          registrado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          aluno_id?: string | null;
          titulo: string;
          descricao: string;
          tipo?: string;
          data?: string;
          registrado_por?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ocorrencias"]["Insert"]>;
        Relationships: [];
      };
      disciplinas: {
        Row: {
          id: string;
          secretaria_id: string;
          nome: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          secretaria_id: string;
          nome: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["disciplinas"]["Insert"]>;
        Relationships: [];
      };
      almoxarifado_itens: {
        Row: {
          id: string;
          escola_id: string;
          nome: string;
          categoria: string;
          quantidade: number;
          unidade: string;
          estoque_minimo: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          nome: string;
          categoria?: string;
          quantidade?: number;
          unidade?: string;
          estoque_minimo?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["almoxarifado_itens"]["Insert"]
        >;
        Relationships: [];
      };
      almoxarifado_movimentos: {
        Row: {
          id: string;
          item_id: string;
          tipo: string;
          quantidade: number;
          motivo: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          tipo: string;
          quantidade: number;
          motivo?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["almoxarifado_movimentos"]["Insert"]
        >;
        Relationships: [];
      };
      entradas_alunos: {
        Row: {
          id: string;
          escola_id: string;
          matricula_id: string;
          data: string;
          hora: string;
          registrado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          matricula_id: string;
          data?: string;
          hora?: string;
          registrado_por?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["entradas_alunos"]["Insert"]
        >;
        Relationships: [];
      };
      folgas_escolares: {
        Row: {
          id: string;
          escola_id: string;
          titulo: string;
          data_inicio: string;
          data_fim: string;
          descricao: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          titulo: string;
          data_inicio: string;
          data_fim: string;
          descricao?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["folgas_escolares"]["Insert"]
        >;
        Relationships: [];
      };
      estrutura_escolar: {
        Row: {
          id: string;
          escola_id: string;
          tipo: string;
          nome: string;
          capacidade: number | null;
          descricao: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          tipo?: string;
          nome: string;
          capacidade?: number | null;
          descricao?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["estrutura_escolar"]["Insert"]
        >;
        Relationships: [];
      };
      escala_vigilantes: {
        Row: {
          id: string;
          escola_id: string;
          data: string;
          turno: string;
          vigilante_nome: string;
          observacao: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          data: string;
          turno?: string;
          vigilante_nome: string;
          observacao?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["escala_vigilantes"]["Insert"]
        >;
        Relationships: [];
      };
      escolas: {
        Row: {
          id: string;
          secretaria_id: string;
          nome: string;
          inep: string | null;
          endereco: string | null;
          ativa: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          secretaria_id: string;
          nome: string;
          inep?: string | null;
          endereco?: string | null;
          ativa?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["escolas"]["Insert"]>;
        Relationships: [];
      };
      matriculas: {
        Row: {
          id: string;
          aluno_id: string;
          turma_id: string;
          ano_letivo_id: string;
          status: string;
          data_matricula: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          aluno_id: string;
          turma_id: string;
          ano_letivo_id: string;
          status?: string;
          data_matricula?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matriculas"]["Insert"]>;
        Relationships: [];
      };
      merenda_registros: {
        Row: {
          id: string;
          escola_id: string;
          data: string;
          refeicao: string;
          cardapio: string;
          qtd_alunos: number;
          observacao: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          data?: string;
          refeicao?: string;
          cardapio: string;
          qtd_alunos?: number;
          observacao?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["merenda_registros"]["Insert"]
        >;
        Relationships: [];
      };
      notas: {
        Row: {
          id: string;
          atribuicao_id: string;
          matricula_id: string;
          bimestre_id: string;
          nota: number | null;
          recuperacao: number | null;
          media_bimestre: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          atribuicao_id: string;
          matricula_id: string;
          bimestre_id: string;
          nota?: number | null;
          recuperacao?: number | null;
          media_bimestre?: number | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notas"]["Insert"]>;
        Relationships: [];
      };
      planos_aula: {
        Row: {
          id: string;
          professor_id: string;
          atribuicao_id: string | null;
          tema: string;
          serie: string;
          disciplina: string | null;
          conteudo_ia: string;
          conteudo_final: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professor_id: string;
          atribuicao_id?: string | null;
          tema: string;
          serie: string;
          disciplina?: string | null;
          conteudo_ia: string;
          conteudo_final?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["planos_aula"]["Insert"]>;
        Relationships: [];
      };
      planos_curso: {
        Row: {
          id: string;
          professor_id: string;
          atribuicao_id: string | null;
          nivel: "fundamental" | "infantil";
          disciplina: string;
          serie: string;
          titulo: string;
          conteudo_ia: string;
          conteudo_final: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professor_id: string;
          atribuicao_id?: string | null;
          nivel: "fundamental" | "infantil";
          disciplina: string;
          serie: string;
          titulo: string;
          conteudo_ia: string;
          conteudo_final?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["planos_curso"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          secretaria_id: string | null;
          escola_id: string | null;
          role: UserRoleEnum;
          nome: string;
          cpf: string | null;
          email: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          secretaria_id?: string | null;
          escola_id?: string | null;
          role: UserRoleEnum;
          nome: string;
          cpf?: string | null;
          email: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      registros_frequencia: {
        Row: {
          id: string;
          chamada_id: string;
          matricula_id: string;
          status: PresencaStatusEnum;
        };
        Insert: {
          id?: string;
          chamada_id: string;
          matricula_id: string;
          status?: PresencaStatusEnum;
        };
        Update: Partial<
          Database["public"]["Tables"]["registros_frequencia"]["Insert"]
        >;
        Relationships: [];
      };
      reunioes_escolares: {
        Row: {
          id: string;
          escola_id: string;
          ano_letivo_id: string | null;
          titulo: string;
          data: string;
          hora: string | null;
          local: string | null;
          descricao: string | null;
          tipo: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          ano_letivo_id?: string | null;
          titulo: string;
          data: string;
          hora?: string | null;
          local?: string | null;
          descricao?: string | null;
          tipo?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["reunioes_escolares"]["Insert"]
        >;
        Relationships: [];
      };
      secretarias: {
        Row: {
          id: string;
          nome: string;
          municipio: string;
          uf: string;
          cabecalho_pdf: string | null;
          subtitulo_pdf: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          municipio: string;
          uf: string;
          cabecalho_pdf?: string | null;
          subtitulo_pdf?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["secretarias"]["Insert"]>;
        Relationships: [];
      };
      tarefas_escolares: {
        Row: {
          id: string;
          atribuicao_id: string;
          titulo: string;
          descricao: string;
          data_entrega: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          atribuicao_id: string;
          titulo: string;
          descricao: string;
          data_entrega: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["tarefas_escolares"]["Insert"]
        >;
        Relationships: [];
      };
      turmas: {
        Row: {
          id: string;
          escola_id: string;
          ano_letivo_id: string;
          nome: string;
          serie: string;
          turno: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          escola_id: string;
          ano_letivo_id: string;
          nome: string;
          serie: string;
          turno: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["turmas"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      bi_alunos_evasao: {
        Args: { p_limite?: number };
        Returns: {
          matricula_id: string;
          aluno_id: string;
          aluno_nome: string;
          escola_id: string;
          escola_nome: string;
          turma_nome: string;
          serie: string;
          total_aulas: number;
          total_faltas: number;
          percentual_faltas: number;
        }[];
      };
      bi_desempenho_rede: {
        Args: {
          p_escola_id?: string | null;
          p_serie?: string | null;
          p_disciplina_id?: string | null;
          p_bimestre_id?: string | null;
        };
        Returns: {
          escola_id: string;
          escola_nome: string;
          serie: string;
          disciplina_id: string;
          disciplina_nome: string;
          bimestre_numero: number;
          media: number;
          total_notas: number;
        }[];
      };
      atribuicao_escola_id: {
        Args: { p_atribuicao_id: string };
        Returns: string;
      };
      get_my_escola_id: { Args: Record<string, never>; Returns: string };
      get_my_role: { Args: Record<string, never>; Returns: UserRoleEnum };
      get_my_secretaria_id: { Args: Record<string, never>; Returns: string };
      is_dia_letivo: {
        Args: { p_data: string; p_ano_letivo_id: string };
        Returns: boolean;
      };
      is_my_atribuicao: {
        Args: { p_atribuicao_id: string };
        Returns: boolean;
      };
      resolve_login_email: {
        Args: { login_input: string };
        Returns: string;
      };
      sga_criar_usuario: {
        Args: {
          p_nome: string;
          p_email: string;
          p_cpf: string;
          p_senha: string;
          p_role: UserRoleEnum;
          p_escola_id?: string | null;
          p_ativo?: boolean;
        };
        Returns: string;
      };
      sga_atualizar_usuario: {
        Args: {
          p_user_id: string;
          p_nome: string;
          p_email: string;
          p_cpf: string;
          p_role: UserRoleEnum;
          p_escola_id?: string | null;
          p_ativo?: boolean;
          p_senha?: string | null;
        };
        Returns: undefined;
      };
      sga_toggle_usuario_ativo: {
        Args: {
          p_user_id: string;
          p_ativo: boolean;
        };
        Returns: undefined;
      };
    };
    Enums: {
      presenca_status: PresencaStatusEnum;
      user_role: UserRoleEnum;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type UserRole = Database["public"]["Enums"]["user_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PresencaStatus = Database["public"]["Enums"]["presenca_status"];
