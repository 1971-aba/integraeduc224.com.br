import Link from "next/link";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  AlunoSemMatriculaRow,
  MatriculaCorrecaoRow,
} from "@/components/gestor/corrigir-matriculas-panel";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getCorrecaoMatriculas2026 } from "@/lib/gestor-matriculas-correcao";
import { createClient } from "@/lib/supabase/server";

export default async function GestorCorrigirMatriculasPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id || !profile.secretaria_id) {
    return (
      <>
        <GestorPageHeader title="Corrigir Matrículas 2026" />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
          <CardDescription>
            Vincule uma unidade escolar ao perfil para gerenciar matrículas.
          </CardDescription>
        </Card>
      </>
    );
  }

  const supabase = await createClient();

  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, serie, turno")
    .eq("escola_id", profile.escola_id)
    .order("nome");

  const turmasOptions = (turmas ?? []).map((turma) => ({
    id: turma.id,
    label: `${turma.nome} — ${turma.serie} (${turma.turno})`,
  }));

  const resumo = await getCorrecaoMatriculas2026(
    profile.escola_id,
    profile.secretaria_id,
    {
      turmaId: params.turma,
      busca: params.q,
    },
  );

  const csvRows = resumo.matriculas.map((m) => ({
    aluno: m.alunoNome,
    turma: m.turmaNome,
    serie: m.turmaSerie,
    data: m.dataMatricula,
    status: m.status,
    duplicada: m.duplicada ? "Sim" : "Não",
  }));

  return (
    <>
      <GestorPageHeader
        title="Corrigir Matrículas 2026"
        description="Transferências, cancelamentos e regularização de matrículas do ano letivo"
        actions={
          <Link
            href="/gestor/alunos/novo"
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
          >
            Novo aluno
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardDescription>Matrículas ativas</CardDescription>
          <CardTitle className="text-2xl">
            {resumo.totalMatriculasAtivas}
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Alunos sem matrícula</CardDescription>
          <CardTitle className="text-2xl text-amber-700">
            {resumo.alunosSemMatricula}
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Duplicidades</CardDescription>
          <CardTitle className="text-2xl text-rose-700">
            {resumo.matriculasDuplicadas}
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Ano letivo</CardDescription>
          <CardTitle className="text-2xl">{resumo.ano}</CardTitle>
        </Card>
      </div>

      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label
            htmlFor="turma"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Turma
          </label>
          <select
            id="turma"
            name="turma"
            defaultValue={params.turma ?? ""}
            className="h-10 min-w-[200px] rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Todas as turmas</option>
            {turmasOptions.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="q"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Buscar aluno
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Nome do estudante..."
            className="h-10 min-w-[220px] rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Filtrar
        </button>
      </form>

      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Matrículas ativas em {resumo.ano}</CardTitle>
            <CardDescription>
              Transferir turma, corrigir data ou cancelar matrícula
            </CardDescription>
          </div>
          <ExportarCsv
            rows={csvRows}
            filename={`matriculas-${resumo.ano}.csv`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Aluno</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Data matrícula</th>
                <th className="px-3 py-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resumo.matriculas.map((matricula) => (
                <MatriculaCorrecaoRow
                  key={matricula.matriculaId}
                  matricula={matricula}
                  turmas={turmasOptions}
                />
              ))}
              {resumo.matriculas.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhuma matrícula ativa encontrada para os filtros
                    selecionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {resumo.alunosSemVinculo.length > 0 ? (
        <Card>
          <CardTitle>Alunos cadastrados sem matrícula em {resumo.ano}</CardTitle>
          <CardDescription>
            {resumo.alunosSemVinculo.length} estudante(s) aguardando
            matrícula
          </CardDescription>
          <ul className="mt-4 space-y-2">
            {resumo.alunosSemVinculo.map((aluno) => (
              <AlunoSemMatriculaRow
                key={aluno.alunoId}
                aluno={aluno}
                turmas={turmasOptions}
              />
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
