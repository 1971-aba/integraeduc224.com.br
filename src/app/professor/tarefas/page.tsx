import { listTarefasProfessor } from "@/actions/professor-tarefas";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { TarefaForm, TarefaListItem } from "@/components/professor/tarefas-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getProfessorAtribuicoes } from "@/lib/diario";

export default async function ProfessorTarefasPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);

  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const atribuicoesAtivas = atribuicoes.filter(
    (item) => item.anos_letivos?.ativo,
  );

  const turmas = atribuicoesAtivas.map((item) => ({
    id: item.id,
    label: `${item.disciplinas?.nome} — ${item.turmas?.nome} (${item.turmas?.serie})`,
  }));

  const atribuicaoId = params.turma ?? turmas[0]?.id;
  const tarefas = await listTarefasProfessor(
    profile.id,
    atribuicaoId,
  );

  const hoje = new Date().toISOString().slice(0, 10);
  const pendentes = tarefas.filter((t) => t.dataEntrega >= hoje).length;

  return (
    <>
      <GestorPageHeader
        title="Tarefas e Trabalhos"
        description="Atividades e trabalhos publicados para as turmas"
      />

      {turmas.length > 0 ? (
        <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
          <div>
            <label
              htmlFor="turma"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Turma / Disciplina
            </label>
            <select
              id="turma"
              name="turma"
              defaultValue={atribuicaoId ?? ""}
              className="h-10 min-w-[240px] rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
          >
            Filtrar
          </button>
        </form>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardDescription>Tarefas publicadas</CardDescription>
          <CardTitle className="text-2xl">{tarefas.length}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Com prazo em aberto</CardDescription>
          <CardTitle className="text-2xl text-emerald-700">{pendentes}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Lista de tarefas</CardTitle>
          <CardDescription>
            {atribuicaoId
              ? "Tarefas da turma selecionada"
              : "Selecione uma turma vinculada"}
          </CardDescription>
          <ul className="mt-4 space-y-3">
            {tarefas.map((tarefa) => (
              <TarefaListItem key={tarefa.id} tarefa={tarefa} />
            ))}
            {tarefas.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma tarefa publicada.
              </li>
            ) : null}
          </ul>
        </Card>

        {turmas.length > 0 ? (
          <TarefaForm turmas={turmas} defaultAtribuicaoId={atribuicaoId} />
        ) : (
          <Card>
            <CardTitle>Sem turmas vinculadas</CardTitle>
            <CardDescription>
              Aguarde a atribuição docente para publicar tarefas.
            </CardDescription>
          </Card>
        )}
      </div>
    </>
  );
}
