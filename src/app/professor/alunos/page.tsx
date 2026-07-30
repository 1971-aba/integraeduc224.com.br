import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getProfessorAtribuicoes } from "@/lib/diario";
import { createClient } from "@/lib/supabase/server";

export default async function ProfessorAlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["professor"]);
  const supabase = await createClient();

  const atribuicoes = await getProfessorAtribuicoes(profile.id);
  const atribuicoesAtivas = atribuicoes.filter(
    (item) => item.anos_letivos?.ativo,
  );

  const turmaIds = [
    ...new Set(atribuicoesAtivas.map((item) => item.turma_id)),
  ];

  const atribuicaoId =
    params.turma ??
    atribuicoesAtivas.find((item) => item.turma_id === turmaIds[0])?.id ??
    atribuicoesAtivas[0]?.id;

  const atribuicaoSelecionada = atribuicoesAtivas.find(
    (item) => item.id === atribuicaoId,
  );
  const turmaIdSelecionada = atribuicaoSelecionada?.turma_id;

  const { data: matriculas } = turmaIdSelecionada
    ? await supabase
        .from("matriculas")
        .select("id, aluno_id, status")
        .eq("turma_id", turmaIdSelecionada)
        .eq("status", "ativa")
    : { data: [] };

  const alunoIds = matriculas?.map((m) => m.aluno_id) ?? [];

  let alunosQuery = alunoIds.length
    ? supabase
        .from("alunos")
        .select("id, nome, cpf, data_nascimento")
        .in("id", alunoIds)
        .order("nome")
    : null;

  if (alunosQuery && params.q?.trim()) {
    alunosQuery = alunosQuery.ilike("nome", `%${params.q.trim()}%`);
  }

  const { data: alunos } = alunosQuery
    ? await alunosQuery
    : { data: [] as Array<{ id: string; nome: string; cpf: string | null; data_nascimento: string | null }> };

  const turmasOptions = atribuicoesAtivas.map((item) => ({
    id: item.id,
    label: `${item.disciplinas?.nome} — ${item.turmas?.nome} (${item.turmas?.serie})`,
  }));

  return (
    <>
      <GestorPageHeader
        title="Turmas e Alunos"
        description="Estudantes matriculados nas turmas vinculadas ao professor"
      />

      {turmasOptions.length > 0 ? (
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
              className="h-10 min-w-[200px] rounded-md border border-slate-300 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
          >
            Filtrar
          </button>
        </form>
      ) : null}

      <Card>
        <CardTitle>
          {atribuicaoSelecionada
            ? `${atribuicaoSelecionada.disciplinas?.nome} — ${atribuicaoSelecionada.turmas?.nome}`
            : "Alunos matriculados"}
        </CardTitle>
        <CardDescription>
          {alunos?.length ?? 0} estudante(s) na turma selecionada
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Nome</th>
                <th className="py-2 pr-3 font-medium">CPF</th>
                <th className="py-2 font-medium">Nascimento</th>
              </tr>
            </thead>
            <tbody>
              {alunos?.map((aluno) => (
                <tr key={aluno.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-900">
                    {aluno.nome}
                  </td>
                  <td className="py-2 pr-3 text-slate-600">
                    {aluno.cpf ?? "—"}
                  </td>
                  <td className="py-2 text-slate-600">
                    {aluno.data_nascimento
                      ? new Date(
                          `${aluno.data_nascimento}T12:00:00`,
                        ).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                </tr>
              ))}
              {(alunos?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    {turmasOptions.length === 0
                      ? "Nenhuma turma vinculada ao seu perfil."
                      : "Nenhum aluno encontrado."}
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
