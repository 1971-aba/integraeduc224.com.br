import {
  listEntradasHoje,
} from "@/actions/gestor-entrada-feriados";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import {
  EntradaAlunoButton,
  EntradasRegistradasList,
} from "@/components/gestor/entrada-alunos-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getMatriculasEntradaEscola } from "@/lib/gestor-entrada-feriados";

export default async function GestorEntradaAlunosPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Entrada de Alunos" />
        <Card>
          <CardTitle>Escola não vinculada</CardTitle>
        </Card>
      </>
    );
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const dataFormatada = new Date(`${hoje}T12:00:00`).toLocaleDateString(
    "pt-BR",
    { weekday: "long", day: "2-digit", month: "long", year: "numeric" },
  );

  const [matriculas, entradas] = await Promise.all([
    getMatriculasEntradaEscola(profile.escola_id),
    listEntradasHoje(profile.escola_id, hoje),
  ]);

  const entradasPorMatricula = new Set(
    entradas.map((e) => e.matriculaId),
  );

  return (
    <>
      <GestorPageHeader
        title="Entrada de Alunos"
        description={`Controle de chegada — ${dataFormatada}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardDescription>Matriculados</CardDescription>
          <CardTitle className="text-2xl">{matriculas.length}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Entradas hoje</CardDescription>
          <CardTitle className="text-2xl text-emerald-700">
            {entradas.length}
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Pendentes</CardDescription>
          <CardTitle className="text-2xl text-amber-700">
            {matriculas.length - entradas.length}
          </CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Registrar entrada</CardTitle>
          <CardDescription>
            Clique para registrar a chegada do estudante
          </CardDescription>
          <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto">
            {matriculas.map((matricula) => (
              <li
                key={matricula.matriculaId}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {matricula.alunoNome}
                  </p>
                  <p className="text-slate-600">
                    {matricula.turmaNome} ({matricula.turmaSerie})
                  </p>
                </div>
                <EntradaAlunoButton
                  matriculaId={matricula.matriculaId}
                  alunoNome={matricula.alunoNome}
                  jaRegistrado={entradasPorMatricula.has(
                    matricula.matriculaId,
                  )}
                />
              </li>
            ))}
            {matriculas.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum aluno matriculado.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <CardTitle>Entradas registradas hoje</CardTitle>
          <CardDescription>{entradas.length} registro(s)</CardDescription>
          <div className="mt-4">
            <EntradasRegistradasList entradas={entradas} />
          </div>
        </Card>
      </div>
    </>
  );
}
