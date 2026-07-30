import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EVASAO_LIMITE_PERCENTUAL } from "@/lib/bi-types";
import { requireRole } from "@/lib/auth";
import {
  agruparEvasaoEscolaPorTurma,
  getCoordenadorEscolaId,
  getEvasaoEscola,
} from "@/lib/coordenador-data";

export default async function CoordenadorEvasaoPage() {
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const escolaId = getCoordenadorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Evasão Escolar"
          description="Alunos com frequência abaixo do limite legal"
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
          <CardDescription>Turmas com alunos acima do limite</CardDescription>
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

      {porTurma.length > 0 ? (
        <Card className="mb-6">
          <CardTitle>Alerta por turma</CardTitle>
          <CardDescription>
            Distribuição dos alunos em situação de evasão
          </CardDescription>
          <ul className="mt-4 space-y-2">
            {porTurma.map((item) => (
              <li
                key={item.turma}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 text-sm"
              >
                <span className="font-medium text-slate-900">{item.turma}</span>
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  {item.total} aluno(s)
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Lista de monitoramento</CardTitle>
        <CardDescription>
          Alunos da escola que atingiram o limite legal de faltas
        </CardDescription>

        <div className="mt-4 hidden overflow-x-auto md:block">
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

        <ul className="mt-4 space-y-3 md:hidden">
          {alunos.map((aluno) => (
            <li
              key={aluno.matricula_id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-slate-900">{aluno.aluno_nome}</p>
                <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                  {aluno.percentual_faltas}%
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {aluno.turma_nome} ({aluno.serie})
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Faltas: {aluno.total_faltas}/{aluno.total_aulas}
              </p>
            </li>
          ))}
          {alunos.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
              Nenhum aluno em situação de evasão detectada nesta escola.
            </li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
