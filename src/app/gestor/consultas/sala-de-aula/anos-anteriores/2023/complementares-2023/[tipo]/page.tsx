import { notFound, redirect } from "next/navigation";

const TIPOS_COMPLEMENTARES_2023: Record<string, string> = {
  "matricula-detalhada": "Matrícula Detalhada",
  "desempenho-alunos": "Desempenho Alunos",
};

export default async function GestorSalaDeAulaComplementares2023TipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const label = TIPOS_COMPLEMENTARES_2023[tipo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2023 — Complementares — ${label}`)}`,
  );
}
