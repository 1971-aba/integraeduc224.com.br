import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EVASAO_LIMITE_PERCENTUAL } from "@/lib/bi-types";
import { requireRole } from "@/lib/auth";
import {
  agruparEvasaoEscolaPorTurma,
  getEvasaoEscola,
} from "@/lib/coordenador-data";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";

export default async function GestorConsultaEvasaoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Evasão Escolar"
          description="Alunos com frequência abaixo do limite legal"
          actions={<BackLink />}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const alunos = await getEvasaoEscola(escolaId);
  const porTurma = agruparEvasaoEscolaPorTurma(alunos);

  return (
    <>
      <GestorPageHeader
        title="Evasão Escolar"
        description={`Alunos com ${EVASAO_LIMITE_PERCENTUAL}% ou mais de faltas na unidade`}
        actions={<BackLink />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle className="text-base">Alunos em alerta</CardTitle>
          <p className="mt-2 text-3xl font-bold text-red-600">{alunos.length}</p>
          <CardDescription>
            Limite legal de {EVASAO_LIMITE_PERCENTUAL}% de faltas
          </CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-base">Turmas afetadas</CardTitle>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {porTurma.length}
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base">Maior índice</CardTitle>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {alunos[0]?.percentual_faltas ?? 0}%
          </p>
          <CardDescription>
            {alunos[0]?.aluno_nome ?? "Nenhum alerta ativo"}
          </CardDescription>
        </Card>
      </div>

      <Card>
        <CardTitle>Lista de monitoramento</CardTitle>
        <CardDescription>
          Alunos da escola que atingiram o limite legal de faltas
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Aluno</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Faltas</th>
                <th className="px-3 py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.matricula_id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {aluno.aluno_nome}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {aluno.turma_nome} ({aluno.serie})
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {aluno.total_faltas}/{aluno.total_aulas}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      {aluno.percentual_faltas}%
                    </span>
                  </td>
                </tr>
              ))}
              {alunos.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    Nenhum aluno em situação de evasão detectada nesta escola.
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

function BackLink() {
  return (
    <Link
      href="/gestor/relatorios"
      className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Relatórios
    </Link>
  );
}
