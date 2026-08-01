import { notFound, redirect } from "next/navigation";

const TIPOS_COMPLEMENTARES_2025: Record<string, string> = {
  "matricula-detalhada": "Matrícula Detalhada",
  "desempenho-alunos": "Desempenho Alunos",
};

export default async function GestorSalaDeAulaComplementares2025TipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const label = TIPOS_COMPLEMENTARES_2025[tipo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2025 — Complementares — ${label}`)}`,
  );
}
