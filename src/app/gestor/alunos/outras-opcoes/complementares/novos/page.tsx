import Link from "next/link";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Janela que caracteriza uma matrícula recente. */
const DIAS_RECENTE = 30;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function diasDesde(data: string) {
  const referencia = new Date(`${data}T12:00:00`).getTime();
  return Math.floor((Date.now() - referencia) / MS_POR_DIA);
}

export default async function AlunosNovosPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Alunos Novos da Escola"
          description="Matrículas mais recentes desta unidade"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: escola }, { data: turmas }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("turmas")
      .select("id, nome, serie")
      .eq("escola_id", profile.escola_id),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("id, aluno_id, turma_id, data_matricula")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
        .order("data_matricula", { ascending: false })
    : { data: [] };

  const alunoIds = [
    ...new Set(matriculas?.map((matricula) => matricula.aluno_id) ?? []),
  ];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome, nome_mae")
        .in("id", alunoIds)
    : { data: [] };

  const alunoPorId = new Map(alunos?.map((aluno) => [aluno.id, aluno]) ?? []);
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);

  const registros = (matriculas ?? []).map((matricula) => {
    const aluno = alunoPorId.get(matricula.aluno_id);
    const turma = turmaPorId.get(matricula.turma_id);

    return {
      id: matricula.id,
      alunoId: matricula.aluno_id,
      nome: aluno?.nome ?? "Aluno",
      responsavel: aluno?.nome_mae ?? "—",
      turma: turma ? `${turma.nome} (${turma.serie})` : "Sem turma",
      data: matricula.data_matricula,
      dias: diasDesde(matricula.data_matricula),
    };
  });

  const recentes = registros.filter((registro) => registro.dias <= DIAS_RECENTE);

  const linhasCsv = registros.map((registro) => ({
    Aluno: registro.nome,
    Turma: registro.turma,
    Responsavel: registro.responsavel,
    "Data da matricula": new Date(
      `${registro.data}T12:00:00`,
    ).toLocaleDateString("pt-BR"),
  }));

  return (
    <>
      <GestorPageHeader
        title="Alunos Novos da Escola"
        description={`${recentes.length} matrícula(s) nos últimos ${DIAS_RECENTE} dias · ${
          escola?.nome ?? "Unidade Escolar"
        }`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="alunos-novos.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <Card>
        <CardTitle>Matrículas por data de entrada</CardTitle>
        <CardDescription>
          Da mais recente para a mais antiga; as dos últimos {DIAS_RECENTE} dias
          aparecem destacadas
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Aluno</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Responsável</th>
                <th className="px-3 py-2 font-medium">Matrícula</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr
                  key={registro.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3">
                    <Link
                      href={`/gestor/alunos/${registro.alunoId}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {registro.nome}
                    </Link>
                    {registro.dias <= DIAS_RECENTE ? (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Novo
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{registro.turma}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {registro.responsavel}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {new Date(`${registro.data}T12:00:00`).toLocaleDateString(
                      "pt-BR",
                    )}
                    <span className="ml-1 text-slate-400">
                      ({registro.dias === 0 ? "hoje" : `há ${registro.dias} d`})
                    </span>
                  </td>
                </tr>
              ))}
              {registros.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhuma matrícula ativa nesta escola.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
