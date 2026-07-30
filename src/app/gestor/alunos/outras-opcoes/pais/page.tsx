import Link from "next/link";
import { Users } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Responsavel = {
  nome: string;
  filhos: { id: string; nome: string; turma: string }[];
};

export default async function PaisDeAlunoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const escolaId = profile.escola_id;

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Pais de Aluno da Escola"
          description="Responsáveis pelos alunos matriculados nesta unidade"
        />
        <Card>
          <CardTitle>Perfil sem escola vinculada</CardTitle>
          <CardDescription>
            Esta tela reúne os responsáveis dos alunos de uma unidade escolar.
          </CardDescription>
        </Card>
      </>
    );
  }

  const [{ data: escola }, { data: turmas }] = await Promise.all([
    supabase.from("escolas").select("nome").eq("id", escolaId).maybeSingle(),
    supabase
      .from("turmas")
      .select("id, nome, serie")
      .eq("escola_id", escolaId),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id, turma_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const turmaPorAluno = new Map(
    matriculas?.map((matricula) => [matricula.aluno_id, matricula.turma_id]) ??
      [],
  );
  const turmaPorId = new Map(turmas?.map((turma) => [turma.id, turma]) ?? []);
  const alunoIds = [...turmaPorAluno.keys()];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome, nome_mae")
        .in("id", alunoIds)
        .order("nome")
    : { data: [] };

  // O responsável é agrupado pelo nome informado na matrícula: irmãos na mesma
  // escola aparecem sob um único registro.
  const porResponsavel = new Map<string, Responsavel>();
  const semResponsavel: string[] = [];

  for (const aluno of alunos ?? []) {
    const turmaId = turmaPorAluno.get(aluno.id);
    const turma = turmaId ? turmaPorId.get(turmaId) : null;
    const turmaLabel = turma ? `${turma.nome} (${turma.serie})` : "Sem turma";

    const nomeResponsavel = aluno.nome_mae?.trim();

    if (!nomeResponsavel) {
      semResponsavel.push(aluno.nome);
      continue;
    }

    const chave = nomeResponsavel.toLocaleUpperCase("pt-BR");
    const registro = porResponsavel.get(chave) ?? {
      nome: nomeResponsavel,
      filhos: [],
    };
    registro.filhos.push({
      id: aluno.id,
      nome: aluno.nome,
      turma: turmaLabel,
    });
    porResponsavel.set(chave, registro);
  }

  const responsaveis = [...porResponsavel.values()].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );

  const linhasCsv = responsaveis.flatMap((responsavel) =>
    responsavel.filhos.map((filho) => ({
      Responsavel: responsavel.nome,
      Aluno: filho.nome,
      Turma: filho.turma,
    })),
  );

  return (
    <>
      <GestorPageHeader
        title="Pais de Aluno da Escola"
        description={`${responsaveis.length} responsável(is) para ${
          alunos?.length ?? 0
        } aluno(s)${escola?.nome ? ` — ${escola.nome}` : ""}`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="pais-de-alunos.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      {semResponsavel.length > 0 ? (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardTitle className="text-amber-900">
            {semResponsavel.length} aluno(s) sem responsável informado
          </CardTitle>
          <CardDescription className="text-amber-800">
            {semResponsavel.slice(0, 6).join(", ")}
            {semResponsavel.length > 6 ? " e outros" : ""}. Complete o cadastro
            na ficha do aluno.
          </CardDescription>
        </Card>
      ) : null}

      {responsaveis.length === 0 ? (
        <Card>
          <CardTitle>Nenhum responsável cadastrado</CardTitle>
          <CardDescription>
            O nome da mãe ou responsável é informado no cadastro do aluno.
          </CardDescription>
          <Link
            href="/gestor/alunos"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
          >
            Ver alunos
          </Link>
        </Card>
      ) : (
        <Card>
          <CardTitle>Responsáveis</CardTitle>
          <CardDescription>
            Agrupados por nome; irmãos aparecem juntos
          </CardDescription>

          <ul className="mt-4 divide-y divide-slate-100">
            {responsaveis.map((responsavel) => (
              <li key={responsavel.nome} className="py-3">
                <div className="flex items-start gap-2">
                  <Users
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {responsavel.nome}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {responsavel.filhos.map((filho) => (
                        <li key={filho.id} className="text-sm text-slate-600">
                          <Link
                            href={`/gestor/alunos/${filho.id}`}
                            className="hover:underline"
                          >
                            {filho.nome}
                          </Link>{" "}
                          — {filho.turma}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
