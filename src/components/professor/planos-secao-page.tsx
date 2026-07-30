import Link from "next/link";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { PlanosSecaoView } from "@/components/professor/planos-secao-view";
import { requireRole } from "@/lib/auth";
import {
  SECOES_PLANO,
  getPlanosSecaoProfessor,
  tituloNivelPlano,
} from "@/lib/professor-planos";
import type { NivelEnsinoPlano, SecaoPlano } from "@/lib/professor-planos";

type PlanosSecaoPageProps = {
  nivel: NivelEnsinoPlano;
  secao: SecaoPlano;
};

export async function PlanosSecaoPage({ nivel, secao }: PlanosSecaoPageProps) {
  const { profile } = await requireRole(["professor"]);
  const planos = await getPlanosSecaoProfessor(profile.id, nivel, secao);

  const config = SECOES_PLANO[secao];
  const titulo = tituloNivelPlano(nivel);

  return (
    <>
      <GestorPageHeader
        title={`${config.titulo} — ${titulo}`}
        description={config.descricao}
      />

      <Link
        href={`/professor/planos/outras-opcoes/${nivel}`}
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline"
      >
        ← Voltar a Outras opções
      </Link>

      <PlanosSecaoView
        planos={planos}
        novoHref={`/professor/planos/novo?nivel=${nivel}`}
        emptyTitle={`Nenhum plano em ${titulo}`}
        emptyDescription={`Gere planos de aula para o ${titulo.toLowerCase()} para consultar ${config.titulo.toLowerCase()} aqui.`}
        secaoAusenteTexto={`Este plano não possui a seção ${config.titulo.toLowerCase()} registrada.`}
      />
    </>
  );
}
