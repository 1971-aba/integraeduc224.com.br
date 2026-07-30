import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FormularioMatriculaProfessor } from "@/components/gestor/formulario-matricula-professor";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCpf } from "@/lib/utils";

export default async function FormularioMatriculaProfessorPage({
  searchParams,
}: {
  searchParams: Promise<{ professor?: string; branco?: string }>;
}) {
  const { professor: professorId, branco } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Formulário de Matrícula"
          description="Formulário impresso para cadastro do professor"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: escola }, { data: secretaria }, { data: anoLetivo }, { data: professores }] =
    await Promise.all([
      supabase
        .from("escolas")
        .select("nome")
        .eq("id", profile.escola_id)
        .maybeSingle(),
      profile.secretaria_id
        ? supabase
            .from("secretarias")
            .select("nome, municipio, uf")
            .eq("id", profile.secretaria_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("anos_letivos")
        .select("ano")
        .eq("ativo", true)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, nome, cpf, email")
        .eq("escola_id", profile.escola_id)
        .eq("role", "professor")
        .eq("ativo", true)
        .order("nome"),
    ]);

  const professorIds = professores?.map((item) => item.id) ?? [];

  const { data: atribuicoes } = professorIds.length
    ? await supabase
        .from("atribuicoes_docentes")
        .select("professor_id, disciplina_id")
        .in("professor_id", professorIds)
    : { data: [] };

  const disciplinaIds = [
    ...new Set(atribuicoes?.map((item) => item.disciplina_id) ?? []),
  ];

  const { data: disciplinas } = disciplinaIds.length
    ? await supabase.from("disciplinas").select("id, nome").in("id", disciplinaIds)
    : { data: [] };

  const disciplinaPorId = new Map(
    disciplinas?.map((item) => [item.id, item.nome]) ?? [],
  );

  const disciplinasPorProfessor = new Map<string, string[]>();
  for (const item of atribuicoes ?? []) {
    const nome = disciplinaPorId.get(item.disciplina_id);
    if (!nome) continue;
    const lista = disciplinasPorProfessor.get(item.professor_id) ?? [];
    if (!lista.includes(nome)) lista.push(nome);
    disciplinasPorProfessor.set(item.professor_id, lista);
  }

  const professorSelecionado = professorId
    ? professores?.find((item) => item.id === professorId)
    : null;

  const escolaNome = escola?.nome ?? "Unidade Escolar";
  const secretariaNome = secretaria?.nome ?? "Secretaria Municipal de Educação";
  const municipio = secretaria
    ? `${secretaria.municipio}-${secretaria.uf}`
    : "Município";

  const mostrarFormulario = Boolean(professorSelecionado) || branco === "1";

  if (!mostrarFormulario) {
    return (
      <>
        <GestorPageHeader
          title="Formulário de Matrícula"
          description="Imprima em branco ou pré-preenchido com os dados do professor"
          actions={
            <Link
              href="/gestor/professores/formulario-matricula?branco=1"
              className="inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Formulário em branco
            </Link>
          }
        />

        <Card>
          <CardTitle>Pré-preencher com um professor cadastrado</CardTitle>
          <CardDescription>
            {professores?.length ?? 0} professor(es) em {escolaNome}
          </CardDescription>

          {professores?.length ? (
            <ul className="mt-4 space-y-2">
              {professores.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/gestor/professores/formulario-matricula?professor=${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">
                      {item.nome}
                    </span>
                    <span className="shrink-0 text-slate-600">
                      {item.email}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Nenhum professor cadastrado. Use o formulário em branco ou cadastre
              em Professores da Escola.
            </p>
          )}
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="print:hidden">
        <GestorPageHeader
          title="Formulário de Matrícula"
          description={professorSelecionado?.nome ?? "Formulário em branco"}
          actions={
            <Link
              href="/gestor/professores/formulario-matricula"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar
            </Link>
          }
        />
      </div>

      <FormularioMatriculaProfessor
        escolaNome={escolaNome}
        secretariaNome={secretariaNome}
        municipio={municipio}
        anoLetivo={anoLetivo?.ano ?? null}
        professor={
          professorSelecionado
            ? {
                nome: professorSelecionado.nome,
                cpf: professorSelecionado.cpf
                  ? formatCpf(professorSelecionado.cpf)
                  : null,
                email: professorSelecionado.email,
                disciplinas:
                  disciplinasPorProfessor.get(professorSelecionado.id) ?? [],
              }
            : null
        }
      />
    </>
  );
}
