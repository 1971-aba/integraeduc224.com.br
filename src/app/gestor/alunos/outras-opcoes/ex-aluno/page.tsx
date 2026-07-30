import Link from "next/link";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ExAlunoForm } from "@/components/gestor/ex-aluno-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";
import { MOTIVOS_SAIDA_EX_ALUNO } from "@/lib/alunos-escolares-config";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/utils";

function formatNascimento(data: string | null) {
  if (!data) return "—";
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function CadastrarExAlunoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Cadastrar Ex-aluno"
          description="Registro histórico de quem já estudou nesta unidade"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: escola }, { data: exAlunos }] = await Promise.all([
    supabase
      .from("escolas")
      .select("nome")
      .eq("id", profile.escola_id)
      .maybeSingle(),
    supabase
      .from("alunos")
      .select(
        "id, nome, cpf, data_nascimento, ultima_serie, ano_conclusao, motivo_saida",
      )
      .eq("tipo_cadastro", "ex_aluno")
      .eq("escola_origem_id", profile.escola_id)
      .order("nome"),
  ]);

  const linhasCsv = (exAlunos ?? []).map((aluno) => ({
    Nome: aluno.nome,
    CPF: aluno.cpf ? formatCpf(aluno.cpf) : "",
    Nascimento: formatNascimento(aluno.data_nascimento),
    "Ultima serie": aluno.ultima_serie ?? "",
    Ano: aluno.ano_conclusao ? String(aluno.ano_conclusao) : "",
    Motivo: aluno.motivo_saida
      ? MOTIVOS_SAIDA_EX_ALUNO[aluno.motivo_saida]
      : "",
  }));

  return (
    <>
      <GestorPageHeader
        title="Cadastrar Ex-aluno"
        description={`Registro histórico de quem já estudou nesta unidade · ${
          escola?.nome ?? "Unidade Escolar"
        }`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="ex-alunos.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <Card className="h-fit">
          <CardTitle>Novo registro</CardTitle>
          <CardDescription>
            Para quem concluiu, transferiu ou abandonou sem matrícula ativa na
            rede
          </CardDescription>

          <div className="mt-6">
            <ExAlunoForm />
          </div>
        </Card>

        <Card>
          <CardTitle>
            {exAlunos?.length ?? 0} ex-aluno(s) desta escola
          </CardTitle>
          <CardDescription>
            Cadastros históricos feitos nesta unidade
          </CardDescription>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">Última série</th>
                  <th className="px-3 py-2 font-medium">Ano</th>
                  <th className="px-3 py-2 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {(exAlunos ?? []).map((aluno) => (
                  <tr
                    key={aluno.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/gestor/alunos/${aluno.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {aluno.nome}
                      </Link>
                      {aluno.cpf ? (
                        <p className="text-xs text-slate-500">
                          CPF {formatCpf(aluno.cpf)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {aluno.ultima_serie ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {aluno.ano_conclusao ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {aluno.motivo_saida
                        ? MOTIVOS_SAIDA_EX_ALUNO[aluno.motivo_saida]
                        : "—"}
                    </td>
                  </tr>
                ))}
                {(exAlunos?.length ?? 0) === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Nenhum ex-aluno cadastrado nesta escola.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
