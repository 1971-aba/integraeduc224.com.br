import { notFound, redirect } from "next/navigation";

const TIPOS_DIARIO_DE_CLASSE_2025: Record<string, string> = {
  "ensino-fundamental": "Ensino Fundamental",
  "educacao-infantil": "Educação Infantil",
  "atividade-complementar": "Atividade Complementar",
};

export default async function GestorSalaDeAulaDiarioDeClasse2025TipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const label = TIPOS_DIARIO_DE_CLASSE_2025[tipo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2025 — Diário de Classe — ${label}`)}`,
  );
}
