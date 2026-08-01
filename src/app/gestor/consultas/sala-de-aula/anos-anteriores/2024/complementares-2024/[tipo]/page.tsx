import { notFound, redirect } from "next/navigation";

const TIPOS_COMPLEMENTARES_2024: Record<string, string> = {
  "matricula-detalhada": "Matrícula Detalhada",
  "desempenho-alunos": "Desempenho Alunos",
};

export default async function GestorSalaDeAulaComplementares2024TipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const label = TIPOS_COMPLEMENTARES_2024[tipo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2024 — Complementares — ${label}`)}`,
  );
}
