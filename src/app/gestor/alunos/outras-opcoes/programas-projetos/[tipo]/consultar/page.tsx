import { notFound } from "next/navigation";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { getContextoProgramasProjetos } from "@/lib/gestor-programas-projetos";
import {
  ETAPAS_PROGRAMA_PROJETO,
  TIPOS_PROGRAMA_PROJETO,
  resolverTipo,
} from "@/lib/programas-projetos-config";

export default async function ConsultarAlunoProgramasProjetosPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo: slug } = await params;
  const tipo = resolverTipo(slug);

  if (!tipo) notFound();

  const textos = TIPOS_PROGRAMA_PROJETO[tipo];
  const contexto = await getContextoProgramasProjetos(tipo);

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Consultar Aluno"
          description={`Em quais ${textos.plural.toLowerCase()} cada aluno está inscrito`}
        />
        <SemEscolaAlert />
      </>
    );
  }

  const itemPorId = new Map(contexto.itens.map((item) => [item.id, item]));

  // A visão por item é invertida para responder "onde este aluno está".
  const participacaoPorAluno = new Map<string, string[]>();

  for (const [itemId, vinculos] of Object.entries(contexto.vinculosPorItem)) {
    const item = itemPorId.get(itemId);
    if (!item) continue;

    for (const vinculo of vinculos) {
      const lista = participacaoPorAluno.get(vinculo.alunoId) ?? [];
      lista.push(`${item.nome} (${ETAPAS_PROGRAMA_PROJETO[item.etapa].label})`);
      participacaoPorAluno.set(vinculo.alunoId, lista);
    }
  }

  const linhas = contexto.alunos.map((aluno) => ({
    aluno,
    participacoes: participacaoPorAluno.get(aluno.id) ?? [],
  }));

  const inscritos = linhas.filter((linha) => linha.participacoes.length > 0);

  const linhasCsv = inscritos.flatMap((linha) =>
    linha.participacoes.map((participacao) => ({
      Aluno: linha.aluno.nome,
      Turma: linha.aluno.turma,
      [textos.singular]: participacao,
    })),
  );

  return (
    <>
      <GestorPageHeader
        title="Consultar Aluno"
        description={`${inscritos.length} de ${contexto.alunos.length} aluno(s) participam de algum ${textos.singular.toLowerCase()} · ${
          contexto.escolaNome
        }`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename={`${textos.slug}-por-aluno.csv`}
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <Card>
        <CardTitle>Alunos da escola</CardTitle>
        <CardDescription>
          Alunos sem participação aparecem no fim da lista
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Aluno</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">{textos.plural}</th>
              </tr>
            </thead>
            <tbody>
              {[...inscritos, ...linhas.filter((l) => l.participacoes.length === 0)].map(
                (linha) => (
                  <tr
                    key={linha.aluno.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {linha.aluno.nome}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {linha.aluno.turma}
                    </td>
                    <td className="px-3 py-3">
                      {linha.participacoes.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {linha.participacoes.map((participacao) => (
                            <span
                              key={participacao}
                              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                            >
                              {participacao}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              )}
              {contexto.alunos.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum aluno matriculado nesta escola.
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
