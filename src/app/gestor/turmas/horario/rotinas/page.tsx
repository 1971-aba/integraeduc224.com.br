import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getVinculosDocentes,
  montarHorarioEscolar,
  resumoRotinasSemanais,
} from "@/lib/gestor-turmas";
import type { CargaSemanal } from "@/lib/gestor-turmas";

export default async function GestorRotinasSemanaisPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const slots = montarHorarioEscolar(await getVinculosDocentes(profile));
  const rotinas = resumoRotinasSemanais(slots);

  if (rotinas.totalAulas === 0) {
    return (
      <>
        <GestorPageHeader
          title="Rotinas Semanais"
          description="Distribuição das aulas ao longo da semana"
        />
        <Card>
          <CardTitle>Nenhuma rotina para exibir</CardTitle>
          <CardDescription className="mt-2">
            Vincule professores e disciplinas às turmas para gerar a rotina
            semanal.
          </CardDescription>
        </Card>
      </>
    );
  }

  return (
    <>
      <GestorPageHeader
        title="Rotinas Semanais"
        description="Distribuição das aulas ao longo da semana e carga por turma e professor"
      />

      <Card className="mb-6">
        <CardTitle>Aulas por dia</CardTitle>
        <CardDescription>
          {rotinas.totalAulas} aula(s) na semana
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  Dia
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-700">
                  Aulas
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-700">
                  Turmas
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-700">
                  Professores
                </th>
              </tr>
            </thead>
            <tbody>
              {rotinas.porDia.map((dia) => (
                <tr key={dia.dia}>
                  <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-800">
                    {dia.dia}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                    {dia.aulas}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                    {dia.turmas}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                    {dia.professores}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <CargaCard
          titulo="Carga semanal por turma"
          descricao="Total de aulas previstas para cada turma"
          itens={rotinas.porTurma}
        />
        <CargaCard
          titulo="Carga semanal por professor"
          descricao="Total de aulas previstas para cada professor"
          itens={rotinas.porProfessor}
        />
      </div>
    </>
  );
}

function CargaCard({
  titulo,
  descricao,
  itens,
}: {
  titulo: string;
  descricao: string;
  itens: CargaSemanal[];
}) {
  const maximo = Math.max(...itens.map((item) => item.aulas), 1);

  return (
    <Card>
      <CardTitle>{titulo}</CardTitle>
      <CardDescription>{descricao}</CardDescription>

      <ul className="mt-4 space-y-3 text-sm">
        {itens.map((item) => (
          <li key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-800">{item.nome}</span>
              <span className="text-slate-600">{item.aulas} aula(s)</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[#1E7BB8]"
                style={{ width: `${(item.aulas / maximo) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
