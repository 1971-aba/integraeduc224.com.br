import { notFound, redirect } from "next/navigation";

const TIPOS_DIARIO_DE_CLASSE_2023: Record<string, string> = {
  "ensino-fundamental": "Ensino Fundamental",
  "educacao-infantil": "Educação Infantil",
  "atividade-complementar": "Atividade Complementar",
};

export default async function GestorSalaDeAulaDiarioDeClasse2023TipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const label = TIPOS_DIARIO_DE_CLASSE_2023[tipo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2023 — Diário de Classe — ${label}`)}`,
  );
}
