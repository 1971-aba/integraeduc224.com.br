import Link from "next/link";
import { notFound } from "next/navigation";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { AlunoForm } from "@/components/secretaria/aluno-form";
import { MatriculaActions } from "@/components/secretaria/matricula-actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { MATRICULA_STATUS_LABEL } from "@/lib/secretaria-utils";
import { formatCpf } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function AlunoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const supabase = await createClient();

  const { data: aluno } = await supabase
    .from("alunos")
    .select("id, nome, cpf, data_nascimento, nome_mae, nis, secretaria_id")
    .eq("id", id)
    .maybeSingle();

  if (!aluno || aluno.secretaria_id !== profile.secretaria_id) {
    notFound();
  }

  let turmasQuery = supabase
    .from("turmas")
    .select("id, nome, serie, turno, escola_id, ano_letivo_id")
    .order("nome");

  if (profile.role === "gestor_escolar" && profile.escola_id) {
    turmasQuery = turmasQuery.eq("escola_id", profile.escola_id);
  }

  const [{ data: turmas }, { data: matriculas }] = await Promise.all([
    turmasQuery,
    supabase
      .from("matriculas")
      .select("id, turma_id, ano_letivo_id, status, data_matricula, created_at")
      .eq("aluno_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];
  const matriculaAtiva = matriculas?.find(
    (matricula) =>
      matricula.status === "ativa" && turmaIds.includes(matricula.turma_id),
  );

  const turmaAtiva = matriculaAtiva
    ? turmas?.find((turma) => turma.id === matriculaAtiva.turma_id)
    : null;

  const turmasOptions = (turmas ?? []).map((turma) => ({
    id: turma.id,
    label: `${turma.nome} — ${turma.serie} (${turma.turno})`,
  }));

  return (
    <>
      <GestorPageHeader
        title={aluno.nome}
        description="Cadastro, matrícula e histórico escolar"
      />

      <Link
        href="/gestor/alunos"
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar à lista
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Dados cadastrais</CardTitle>
          <CardDescription>Informações exigidas pela LGPD e Censo Escolar</CardDescription>

          <div className="mt-6">
            <AlunoForm
              mode="edit"
              alunoId={aluno.id}
              showTurmaSelect={false}
              defaultValues={{
                nome: aluno.nome,
                cpf: aluno.cpf ? formatCpf(aluno.cpf) : "",
                data_nascimento: aluno.data_nascimento ?? "",
                nome_mae: aluno.nome_mae ?? "",
                nis: aluno.nis ?? "",
              }}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <MatriculaActions
            alunoId={aluno.id}
            matriculaAtiva={
              matriculaAtiva && turmaAtiva
                ? {
                    id: matriculaAtiva.id,
                    turmaId: turmaAtiva.id,
                    turmaNome: turmaAtiva.nome,
                    turmaSerie: turmaAtiva.serie,
                  }
                : null
            }
            turmas={turmasOptions}
          />

          <Card>
            <CardTitle>Histórico de matrículas</CardTitle>
            <CardDescription>Movimentações na unidade escolar</CardDescription>

            <ul className="mt-4 space-y-2">
              {matriculas?.map((matricula) => {
                const turma = turmas?.find((item) => item.id === matricula.turma_id)
                  ?? null;

                return (
                  <li
                    key={matricula.id}
                    className="rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-slate-900">
                      {turma
                        ? `${turma.nome} — ${turma.serie}`
                        : "Turma registrada"}
                    </p>
                    <p className="text-slate-600">
                      {MATRICULA_STATUS_LABEL[matricula.status] ?? matricula.status}{" "}
                      •{" "}
                      {new Date(matricula.data_matricula).toLocaleDateString("pt-BR")}
                    </p>
                  </li>
                );
              }) ?? (
                <li className="text-sm text-slate-500">
                  Nenhuma matrícula registrada.
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
