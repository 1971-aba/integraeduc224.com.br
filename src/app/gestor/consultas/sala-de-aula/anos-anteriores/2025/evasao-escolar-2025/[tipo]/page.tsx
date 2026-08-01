import { notFound, redirect } from "next/navigation";

const TIPOS_EVASAO_2025: Record<string, string> = {
  "todas-as-evasoes": "Todas as Evasões",
  desistentes: "Desistentes",
  transferidos: "Transferidos",
  expulsos: "Expulsos",
  falecidos: "Falecidos",
};

export default async function GestorSalaDeAulaEvasaoEscolar2025TipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const label = TIPOS_EVASAO_2025[tipo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2025 — Evasão Escolar — ${label}`)}`,
  );
}
