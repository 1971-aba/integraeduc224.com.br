import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";
import {
  DEFASAGEM_MINIMA,
  classificarIdade,
  idadeEsperada,
  idadeNoAnoLetivo,
  type SituacaoIdade,
} from "@/lib/idade-serie";
import { createClient } from "@/lib/supabase/server";

type Caso = {
  id: string;
  nome: string;
  turma: string;
  idade: number;
  esperada: number;
  situacao: SituacaoIdade;
};

const ROTULO: Record<SituacaoIdade, string> = {
  defasagem: "Defasagem",
  adiantado: "Idade inferior",
  adequada: "Adequada",
};

export default async function IdadeSeriePage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Casos de Idade Incompatível"
          description="Distorção entre a idade do aluno e a série que ele cursa"
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
      .select("id, nome, serie, ano_letivo_id")
      .eq("escola_id", profile.escola_id),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];
  const anoIds = [...new Set(turmas?.map((turma) => turma.ano_letivo_id) ?? [])];

  const [{ data: matriculas }, { data: anos }] = await Promise.all([
    turmaIds.length
      ? supabase
          .from("matriculas")
          .select("aluno_id, turma_id")
          .in("turma_id", turmaIds)
          .eq("status", "ativa")
      : Promise.resolve({ data: [] }),
    anoIds.length
      ? supabase.from("anos_letivos").select("id, ano").in("id", anoIds)
      : Promise.resolve({ data: [] }),
  ]);

  const alunoIds = [
    ...new Set(matriculas?.map((matricula) => matricula.aluno_id) ?? []),
  ];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome, data_nascimento")
        .in("id", alunoIds)
    : { data: [] };

  const alunoPorId = new Map(alunos?.map((aluno) => [aluno.id, aluno]) ?? []);
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);
  const anoPorId = new Map(anos?.map((ano) => [ano.id, ano.ano]) ?? []);

  const casos: Caso[] = [];
  let semDataNascimento = 0;
  let semParametro = 0;
  let adequados = 0;

  for (const matricula of matriculas ?? []) {
    const aluno = alunoPorId.get(matricula.aluno_id);
    const turma = turmaPorId.get(matricula.turma_id);
    if (!aluno || !turma) continue;

    if (!aluno.data_nascimento) {
      semDataNascimento += 1;
      continue;
    }

    const esperada = idadeEsperada(turma.serie);
    const anoLetivo = anoPorId.get(turma.ano_letivo_id);

    // A Educação Infantil não tem série numerada, então fica fora do cálculo.
    if (esperada === null || !anoLetivo) {
      semParametro += 1;
      continue;
    }

    const idade = idadeNoAnoLetivo(aluno.data_nascimento, anoLetivo);
    const situacao = classificarIdade(idade, esperada);

    if (situacao === "adequada") {
      adequados += 1;
      continue;
    }

    casos.push({
      id: aluno.id,
      nome: aluno.nome,
      turma: `${turma.nome} (${turma.serie})`,
      idade,
      esperada,
      situacao,
    });
  }

  casos.sort(
    (a, b) =>
      b.idade - b.esperada - (a.idade - a.esperada) ||
      a.nome.localeCompare(b.nome, "pt-BR"),
  );

  const linhasCsv = casos.map((caso) => ({
    Aluno: caso.nome,
    Turma: caso.turma,
    Idade: String(caso.idade),
    "Idade esperada": String(caso.esperada),
    Situacao: ROTULO[caso.situacao],
  }));

  return (
    <>
      <GestorPageHeader
        title="Casos de Idade Incompatível"
        description={`Critério do INEP: defasagem a partir de ${DEFASAGEM_MINIMA} anos acima da idade esperada · ${
          escola?.nome ?? "Unidade Escolar"
        }`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="idade-serie.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle className="text-base">Casos encontrados</CardTitle>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {casos.length}
          </p>
          <CardDescription>Fora da faixa esperada</CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-base">Idade adequada</CardTitle>
          <p className="mt-2 text-3xl font-bold text-slate-900">{adequados}</p>
        </Card>
        <Card>
          <CardTitle className="text-base">Sem cálculo</CardTitle>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {semParametro + semDataNascimento}
          </p>
          <CardDescription>
            {semDataNascimento} sem data de nascimento, {semParametro} em etapa
            sem série numerada
          </CardDescription>
        </Card>
      </div>

      <Card>
        <CardTitle>Alunos fora da faixa</CardTitle>
        <CardDescription>
          A idade considerada é a que o aluno completa no ano letivo
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Aluno</th>
                <th className="px-3 py-2 font-medium">Turma</th>
                <th className="px-3 py-2 font-medium">Idade</th>
                <th className="px-3 py-2 font-medium">Esperada</th>
                <th className="px-3 py-2 font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {casos.map((caso) => (
                <tr
                  key={caso.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {caso.nome}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{caso.turma}</td>
                  <td className="px-3 py-3 text-slate-600">{caso.idade} anos</td>
                  <td className="px-3 py-3 text-slate-600">
                    {caso.esperada} anos
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        caso.situacao === "defasagem"
                          ? "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800"
                          : "rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800"
                      }
                    >
                      {ROTULO[caso.situacao]} de{" "}
                      {Math.abs(caso.idade - caso.esperada)} ano(s)
                    </span>
                  </td>
                </tr>
              ))}
              {casos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum caso de idade incompatível nesta escola.
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
