import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { FrequenciaAlunoView } from "@/components/professor/frequencia-aluno-view";
import { requireRole } from "@/lib/auth";
import {
  getEscolaBimestreOptions,
  getFrequenciaConsolidadaEscola,
} from "@/lib/coordenador-data";
import { getGestorEscolaId } from "@/lib/gestor-relatorios";
import {
  filtrarPorTexto,
  flattenFrequenciaAlunos,
} from "@/lib/professor-frequencia-escolar";
import { createClient } from "@/lib/supabase/server";

export default async function GestorSalaDeAulaFrequenciaAlunoPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; q?: string; bimestre?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);
  const escolaId = getGestorEscolaId(profile);

  if (!escolaId) {
    return (
      <>
        <GestorPageHeader title="Frequência Aluno" actions={<BackLink />} />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();
  const [resumos, bimestres] = await Promise.all([
    getFrequenciaConsolidadaEscola(escolaId, params.bimestre),
    getEscolaBimestreOptions(supabase, escolaId),
  ]);

  const atribuicoes = resumos.map((item) => ({
    id: item.atribuicaoId,
    label: `${item.disciplina} — ${item.turma} (${item.serie})`,
  }));

  let resumosFiltrados = resumos;
  if (params.turma) {
    resumosFiltrados = resumosFiltrados.filter(
      (item) => item.atribuicaoId === params.turma,
    );
  }

  const linhas = filtrarPorTexto(
    flattenFrequenciaAlunos(resumosFiltrados),
    params.q,
    ["nome", "turma", "disciplina", "serie"],
  );

  return (
    <>
      <GestorPageHeader
        title="Frequência Aluno"
        description="Consulta individual de presença por estudante da unidade"
        actions={<BackLink />}
      />

      <form className="mb-4 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label
            htmlFor="bimestre"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Bimestre
          </label>
          <select
            id="bimestre"
            name="bimestre"
            defaultValue={params.bimestre ?? ""}
            className="h-10 min-w-[200px] rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Bimestre atual (automático)</option>
            {bimestres.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {params.turma ? (
          <input type="hidden" name="turma" value={params.turma} />
        ) : null}
        {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-[#4097B1] px-4 text-sm font-semibold text-white hover:bg-[#36899f]"
        >
          Atualizar
        </button>
      </form>

      <FrequenciaAlunoView
        linhas={linhas}
        atribuicoes={atribuicoes}
        atribuicaoId={params.turma}
        busca={params.q}
      />
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/gestor/relatorios"
      className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Relatórios
    </Link>
  );
}
