import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getCoordenadorEscolaId,
  getEscolaAtribuicoes,
} from "@/lib/coordenador-data";
import { formatTurnoLabel } from "@/lib/dashboard-utils";
import { createClient } from "@/lib/supabase/server";

export default async function CoordenadorProfessoresPage() {
  const { profile } = await requireRole(["coordenador", "admin_sme"]);
  const escolaId = getCoordenadorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader
          title="Professores"
          description="Corpo docente e atribuições na unidade escolar"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();

  const [{ data: professores }, atribuicoes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, email, ativo")
      .eq("escola_id", escolaId)
      .eq("role", "professor")
      .order("nome"),
    getEscolaAtribuicoes(supabase, escolaId),
  ]);

  const atribuicoesPorProfessor = new Map<string, typeof atribuicoes>();

  for (const atribuicao of atribuicoes) {
    const lista = atribuicoesPorProfessor.get(atribuicao.professorId) ?? [];
    lista.push(atribuicao);
    atribuicoesPorProfessor.set(atribuicao.professorId, lista);
  }

  return (
    <>
      <GestorPageHeader
        title="Professores"
        description="Corpo docente e atribuições na unidade escolar"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Corpo docente</CardTitle>
          <CardDescription>
            {professores?.length ?? 0} professor(es) vinculado(s) à escola
          </CardDescription>

          <ul className="mt-6 space-y-3">
            {professores?.map((professor) => {
              const vinculos =
                atribuicoesPorProfessor.get(professor.id)?.length ?? 0;

              return (
                <li
                  key={professor.id}
                  className="rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">
                        {professor.nome}
                      </p>
                      <p className="text-sm text-slate-600">{professor.email}</p>
                    </div>
                    <span
                      className={
                        professor.ativo
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {professor.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {vinculos} atribuição(ões) docente(s)
                  </p>
                </li>
              );
            }) ?? null}
            {(professores ?? []).length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhum professor cadastrado nesta escola.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <CardTitle>Atribuições docentes</CardTitle>
          <CardDescription>
            {atribuicoes.length} vínculo(s) turma/disciplina
          </CardDescription>

          <ul className="mt-6 space-y-3">
            {atribuicoes.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-100 px-4 py-3 text-sm"
              >
                <p className="font-medium text-slate-900">
                  {item.professorNome} — {item.disciplina}
                </p>
                <p className="text-slate-600">
                  {item.turma} ({item.serie}) • {formatTurnoLabel(item.turno)}
                </p>
              </li>
            ))}
            {atribuicoes.length === 0 ? (
              <li className="text-sm text-slate-500">
                Nenhuma atribuição cadastrada.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </>
  );
}
