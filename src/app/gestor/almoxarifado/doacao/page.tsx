import {
  listAlmoxarifadoDoacoes,
  listAlmoxarifadoItens,
} from "@/actions/gestor-estrutura-almoxarifado";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { DoacaoAlunoForm } from "@/components/gestor/almoxarifado-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default async function GestorAlmoxarifadoDoacaoPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader title="Doação para Alunos" />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: turmas }, itens, doacoes] = await Promise.all([
    supabase
      .from("turmas")
      .select("id")
      .eq("escola_id", profile.escola_id),
    listAlmoxarifadoItens(profile.escola_id),
    listAlmoxarifadoDoacoes(profile.escola_id),
  ]);

  const turmaIds = turmas?.map((turma) => turma.id) ?? [];

  const { data: matriculas } = turmaIds.length
    ? await supabase
        .from("matriculas")
        .select("aluno_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa")
    : { data: [] };

  const alunoIds = [...new Set(matriculas?.map((m) => m.aluno_id) ?? [])];

  const { data: alunos } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome")
        .in("id", alunoIds)
        .order("nome")
    : { data: [] };

  return (
    <>
      <GestorPageHeader
        title="Doação para Alunos"
        description="Registro de materiais do almoxarifado doados a alunos da unidade"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Doações registradas</CardTitle>
          <CardDescription>{doacoes.length} registro(s)</CardDescription>
          <ul className="mt-4 space-y-3">
            {doacoes.map((doacao) => (
              <li
                key={doacao.id}
                className="rounded-xl border border-slate-100 px-4 py-3 text-sm"
              >
                <p className="font-medium text-slate-900">{doacao.itemNome}</p>
                <p className="text-slate-600">
                  {doacao.quantidade} un.
                  {doacao.alunoNome ? ` · ${doacao.alunoNome}` : ""}
                </p>
                {doacao.observacao ? (
                  <p className="mt-1 text-slate-600">{doacao.observacao}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(doacao.createdAt)}
                </p>
              </li>
            ))}
            {doacoes.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma doação registrada.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <DoacaoAlunoForm
            itens={itens.map((item) => ({
              id: item.id,
              nome: item.nome,
              quantidade: item.quantidade,
              unidade: item.unidade,
            }))}
            alunos={alunos ?? []}
          />
        </Card>
      </div>
    </>
  );
}
