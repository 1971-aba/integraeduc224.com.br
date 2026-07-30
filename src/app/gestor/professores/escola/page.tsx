import Link from "next/link";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { ServidorForm } from "@/components/gestor/servidor-form";
import { ServidorListItem } from "@/components/gestor/servidor-list-item";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole, isSgaManagementAvailable } from "@/lib/auth";
import { getProfessoresEscola } from "@/lib/gestor-professores";
import { formatCpf } from "@/lib/utils";

export default async function ProfessoresEscolaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: "ativo" | "inativo" }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const managementAvailable = await isSgaManagementAvailable();
  const contexto = await getProfessoresEscola(params);

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Professores da Escola"
          description="Docentes vinculados a esta unidade escolar"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const linhasCsv = contexto.professores.map((professor) => ({
    Nome: professor.nome,
    Email: professor.email,
    CPF: professor.cpf ? formatCpf(professor.cpf) : "",
    Status: professor.ativo ? "Ativo" : "Inativo",
    Vinculos: String(professor.vinculos),
    Formacoes: String(professor.formacoes),
  }));

  return (
    <>
      <GestorPageHeader
        title="Professores da Escola"
        description={`${contexto.professores.length} professor(es) · ${contexto.escolaNome}`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="professores-escola.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="mb-1 block text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Nome, CPF ou e-mail"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#1E7BB8] px-4 text-sm font-medium text-white hover:bg-[#186399]"
        >
          Filtrar
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Professores cadastrados</CardTitle>
          <CardDescription>
            {contexto.professores.length} registro(s) encontrado(s)
          </CardDescription>
          <ul className="mt-4 space-y-3">
            {contexto.professores.map((professor) => (
              <li key={professor.id}>
                <div className="rounded-lg border border-slate-100 p-4">
                  <ServidorListItem
                    servidor={{
                      id: professor.id,
                      nome: professor.nome,
                      email: professor.email,
                      cpf: professor.cpf,
                      role: "professor",
                      ativo: professor.ativo,
                    }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      {professor.vinculos} vínculo(s)
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      {professor.formacoes} formação(ões)
                    </span>
                    <Link
                      href={`/gestor/professores/formulario-matricula?professor=${professor.id}`}
                      className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Formulário
                    </Link>
                  </div>
                </div>
              </li>
            ))}
            {contexto.professores.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum professor cadastrado nesta escola.
              </li>
            ) : null}
          </ul>
        </Card>

        {managementAvailable ? (
          <ServidorForm fixedRole="professor" />
        ) : (
          <Card>
            <CardTitle>Cadastro indisponível</CardTitle>
            <CardDescription>
              No modo demo, utilize os logins pré-configurados ou configure o
              Supabase Admin para criar novos professores.
            </CardDescription>
          </Card>
        )}
      </div>
    </>
  );
}
